import { useState, useEffect, useRef } from 'react';
import { integrationService } from '@/services/integrationService';
import { Job } from '@/types/integration';

interface UseJobStatusOptions {
  jobId?: string;
  onStatusChange?: (job: Job) => void;
  pollInterval?: number;
}

export const useJobStatus = (options: UseJobStatusOptions = {}) => {
  const { jobId, onStatusChange, pollInterval = 2000 } = options;
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Función para obtener el estado del job via HTTP
  const fetchJobStatus = async (id: string) => {
    try {
      const jobData = await integrationService.getJobById(id);
      setJob(jobData);
      setError(null);
      
      if (onStatusChange) {
        onStatusChange(jobData);
      }
      
      return jobData;
    } catch (err) {
      setError('Error al obtener el estado del job');
      console.error('Error fetching job status:', err);
      return null;
    }
  };

  // Inicializar conexión WebSocket para tiempo real
  const initializeWebSocket = (id: string) => {
    try {
      ws.current = integrationService.createJobStatusWebSocket(id);
      
      ws.current.onopen = () => {
        console.log('WebSocket connected for job:', id);
        setError(null);
      };
      
      ws.current.onmessage = (event) => {
        try {
          const jobData = JSON.parse(event.data);
          setJob(jobData);
          
          if (onStatusChange) {
            onStatusChange(jobData);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Error en la conexión en tiempo real');
        // Fallback a polling si WebSocket falla
        startPolling(id);
      };
      
      ws.current.onclose = () => {
        console.log('WebSocket disconnected for job:', id);
        // Intentar reconectar si el job aún está en ejecución
        if (job && (job.status === 'running' || job.status === 'pending')) {
          setTimeout(() => initializeWebSocket(id), 3000);
        }
      };
    } catch (err) {
      console.error('Error initializing WebSocket:', err);
      // Fallback a polling si WebSocket no está disponible
      startPolling(id);
    }
  };

  // Polling como fallback
  const startPolling = (id: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      fetchJobStatus(id);
    }, pollInterval);
  };

  // Parar monitoreo
  const stopMonitoring = () => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Inicializar monitoreo cuando hay jobId
  useEffect(() => {
    if (jobId) {
      setIsLoading(true);
      
      // Obtener estado inicial
      fetchJobStatus(jobId).then((jobData) => {
        setIsLoading(false);
        
        // Si el job está activo, iniciar monitoreo en tiempo real
        if (jobData && (jobData.status === 'running' || jobData.status === 'pending')) {
          // Intentar WebSocket primero, fallback a polling
          initializeWebSocket(jobId);
        }
      });
    }

    return () => {
      stopMonitoring();
    };
  }, [jobId]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, []);

  return {
    job,
    isLoading,
    error,
    refetch: jobId ? () => fetchJobStatus(jobId) : undefined,
    stopMonitoring
  };
};

// Hook para monitorear múltiples jobs
export const useJobsStatus = (jobIds: string[] = [], pollInterval: number = 5000) => {
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAllJobsStatus = async () => {
    if (jobIds.length === 0) return;

    try {
      setIsLoading(true);
      const jobPromises = jobIds.map(id => integrationService.getJobById(id));
      const jobsData = await Promise.all(jobPromises);
      
      const jobsMap = jobsData.reduce((acc, job, index) => {
        if (job) {
          acc[jobIds[index]] = job;
        }
        return acc;
      }, {} as Record<string, Job>);
      
      setJobs(jobsMap);
      setError(null);
    } catch (err) {
      setError('Error al obtener el estado de los jobs');
      console.error('Error fetching jobs status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (jobIds.length > 0) {
      fetchAllJobsStatus();
      
      // Configurar polling para jobs activos
      intervalRef.current = setInterval(() => {
        const hasActiveJobs = Object.values(jobs).some(
          job => job.status === 'running' || job.status === 'pending'
        );
        
        if (hasActiveJobs || Object.keys(jobs).length === 0) {
          fetchAllJobsStatus();
        }
      }, pollInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [jobIds.join(',')]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    jobs,
    isLoading,
    error,
    refetch: fetchAllJobsStatus
  };
}; 