import { Dataset, DatasetDetail } from '@/types/dataset';

// Mock user data
export const mockUsers = [
  {
    id: '1',
    email: 'demo@demo.com.co',
    name: 'Demo User',
    password: 'demo' // In a real app, passwords would be hashed
  },
  {
    id: '2',
    email: 'admin@example.com',
    name: 'Admin User',
    password: 'admin123'
  }
];

// Mock datasets
export const mockDatasets: Dataset[] = [
  {
    id: '1',
    name: 'Sales Data 2023',
    description: 'Monthly sales data for all regions in 2023. Includes product categories, sales representatives, and revenue figures.',
    createdAt: '2023-01-15T08:30:00Z',
    updatedAt: '2023-03-20T14:45:00Z',
    userId: '1',
    rowCount: 1250,
    columnCount: 8,
    tags: ['sales', 'finance', '2023', 'monthly'],
    isPublic: true
  },
  {
    id: '2',
    name: 'Customer Feedback',
    description: 'Survey responses from customers about our new product line. Includes ratings, comments, and demographic information.',
    createdAt: '2023-02-10T10:15:00Z',
    updatedAt: '2023-02-10T10:15:00Z',
    userId: '1',
    rowCount: 532,
    columnCount: 12,
    tags: ['feedback', 'survey', 'customers', 'product'],
    isPublic: false
  },
  {
    id: '3',
    name: 'Website Analytics',
    description: 'Traffic data from our website including page views, bounce rates, and conversion metrics for the last quarter.',
    createdAt: '2023-03-05T16:20:00Z',
    updatedAt: '2023-04-12T09:30:00Z',
    userId: '1',
    rowCount: 890,
    columnCount: 15,
    tags: ['analytics', 'web', 'traffic', 'quarterly'],
    isPublic: true
  }
];

// Mock dataset details with columns and rows
export const mockDatasetDetails: Record<string, DatasetDetail> = {
  '1': {
    ...mockDatasets[0],
    columns: [
      { id: '1', name: 'Date', type: 'date', description: 'Sales date' },
      { id: '2', name: 'Region', type: 'string', description: 'Sales region' },
      { id: '3', name: 'Product', type: 'string', description: 'Product name' },
      { id: '4', name: 'Category', type: 'string', description: 'Product category' },
      { id: '5', name: 'Representative', type: 'string', description: 'Sales representative' },
      { id: '6', name: 'Units', type: 'number', description: 'Number of units sold' },
      { id: '7', name: 'Revenue', type: 'number', description: 'Total revenue in USD' },
      { id: '8', name: 'Profit', type: 'number', description: 'Profit margin in percentage' }
    ],
    rows: [
      { id: '1', Date: '2023-01-05', Region: 'North', Product: 'Laptop Pro', Category: 'Electronics', Representative: 'John Smith', Units: 12, Revenue: 14400, Profit: 22 },
      { id: '2', Date: '2023-01-10', Region: 'South', Product: 'Smartphone X', Category: 'Electronics', Representative: 'Jane Doe', Units: 25, Revenue: 12500, Profit: 18 },
      { id: '3', Date: '2023-01-15', Region: 'East', Product: 'Wireless Earbuds', Category: 'Accessories', Representative: 'Robert Johnson', Units: 40, Revenue: 3200, Profit: 30 },
      { id: '4', Date: '2023-01-20', Region: 'West', Product: 'Smart Watch', Category: 'Wearables', Representative: 'Sarah Williams', Units: 18, Revenue: 5400, Profit: 25 },
      { id: '5', Date: '2023-01-25', Region: 'North', Product: 'Tablet Mini', Category: 'Electronics', Representative: 'John Smith', Units: 15, Revenue: 6000, Profit: 20 },
      { id: '6', Date: '2023-02-05', Region: 'South', Product: 'Laptop Pro', Category: 'Electronics', Representative: 'Jane Doe', Units: 10, Revenue: 12000, Profit: 22 },
      { id: '7', Date: '2023-02-10', Region: 'East', Product: 'Smartphone X', Category: 'Electronics', Representative: 'Robert Johnson', Units: 30, Revenue: 15000, Profit: 18 },
      { id: '8', Date: '2023-02-15', Region: 'West', Product: 'Wireless Earbuds', Category: 'Accessories', Representative: 'Sarah Williams', Units: 50, Revenue: 4000, Profit: 30 },
      { id: '9', Date: '2023-02-20', Region: 'North', Product: 'Smart Watch', Category: 'Wearables', Representative: 'John Smith', Units: 22, Revenue: 6600, Profit: 25 },
      { id: '10', Date: '2023-02-25', Region: 'South', Product: 'Tablet Mini', Category: 'Electronics', Representative: 'Jane Doe', Units: 18, Revenue: 7200, Profit: 20 }
    ]
  },
  '2': {
    ...mockDatasets[1],
    columns: [
      { id: '1', name: 'ResponseID', type: 'string', description: 'Unique response identifier' },
      { id: '2', name: 'Date', type: 'date', description: 'Survey submission date' },
      { id: '3', name: 'Age', type: 'number', description: 'Respondent age' },
      { id: '4', name: 'Gender', type: 'string', description: 'Respondent gender' },
      { id: '5', name: 'Location', type: 'string', description: 'Respondent location' },
      { id: '6', name: 'ProductRating', type: 'number', description: 'Product rating (1-5)' },
      { id: '7', name: 'EaseOfUse', type: 'number', description: 'Ease of use rating (1-5)' },
      { id: '8', name: 'ValueForMoney', type: 'number', description: 'Value for money rating (1-5)' },
      { id: '9', name: 'WouldRecommend', type: 'boolean', description: 'Would recommend to others' },
      { id: '10', name: 'PurchaseAgain', type: 'boolean', description: 'Would purchase again' },
      { id: '11', name: 'Comments', type: 'string', description: 'Additional comments' },
      { id: '12', name: 'ImprovementSuggestions', type: 'string', description: 'Suggestions for improvement' }
    ],
    rows: [
      { id: '1', ResponseID: 'R001', Date: '2023-02-01', Age: 34, Gender: 'Male', Location: 'New York', ProductRating: 4, EaseOfUse: 5, ValueForMoney: 3, WouldRecommend: true, PurchaseAgain: true, Comments: 'Great product overall!', ImprovementSuggestions: 'Could be a bit more affordable.' },
      { id: '2', ResponseID: 'R002', Date: '2023-02-02', Age: 28, Gender: 'Female', Location: 'Los Angeles', ProductRating: 5, EaseOfUse: 4, ValueForMoney: 4, WouldRecommend: true, PurchaseAgain: true, Comments: 'Exceeded my expectations.', ImprovementSuggestions: 'More color options would be nice.' },
      { id: '3', ResponseID: 'R003', Date: '2023-02-03', Age: 45, Gender: 'Male', Location: 'Chicago', ProductRating: 3, EaseOfUse: 2, ValueForMoney: 3, WouldRecommend: false, PurchaseAgain: false, Comments: 'Decent but not worth the price.', ImprovementSuggestions: 'Needs better instructions and customer support.' },
      { id: '4', ResponseID: 'R004', Date: '2023-02-04', Age: 52, Gender: 'Female', Location: 'Houston', ProductRating: 4, EaseOfUse: 3, ValueForMoney: 4, WouldRecommend: true, PurchaseAgain: true, Comments: 'Very satisfied with my purchase.', ImprovementSuggestions: 'Battery life could be improved.' },
      { id: '5', ResponseID: 'R005', Date: '2023-02-05', Age: 31, Gender: 'Non-binary', Location: 'Phoenix', ProductRating: 5, EaseOfUse: 5, ValueForMoney: 5, WouldRecommend: true, PurchaseAgain: true, Comments: 'Absolutely love it!', ImprovementSuggestions: 'No suggestions, it\'s perfect.' }
    ]
  },
  '3': {
    ...mockDatasets[2],
    columns: [
      { id: '1', name: 'Date', type: 'date', description: 'Date of analytics data' },
      { id: '2', name: 'Page', type: 'string', description: 'Website page URL' },
      { id: '3', name: 'Visitors', type: 'number', description: 'Number of unique visitors' },
      { id: '4', name: 'PageViews', type: 'number', description: 'Total page views' },
      { id: '5', name: 'BounceRate', type: 'number', description: 'Bounce rate percentage' },
      { id: '6', name: 'AvgTimeOnPage', type: 'number', description: 'Average time on page (seconds)' },
      { id: '7', name: 'Conversions', type: 'number', description: 'Number of conversions' },
      { id: '8', name: 'ConversionRate', type: 'number', description: 'Conversion rate percentage' },
      { id: '9', name: 'Source', type: 'string', description: 'Traffic source' },
      { id: '10', name: 'Device', type: 'string', description: 'User device type' },
      { id: '11', name: 'Browser', type: 'string', description: 'User browser' },
      { id: '12', name: 'Country', type: 'string', description: 'User country' },
      { id: '13', name: 'City', type: 'string', description: 'User city' },
      { id: '14', name: 'NewUsers', type: 'number', description: 'Number of new users' },
      { id: '15', name: 'ReturningUsers', type: 'number', description: 'Number of returning users' }
    ],
    rows: [
      { id: '1', Date: '2023-01-01', Page: '/', Visitors: 1250, PageViews: 1800, BounceRate: 35.2, AvgTimeOnPage: 75, Conversions: 45, ConversionRate: 3.6, Source: 'Organic Search', Device: 'Desktop', Browser: 'Chrome', Country: 'United States', City: 'New York', NewUsers: 875, ReturningUsers: 375 },
      { id: '2', Date: '2023-01-01', Page: '/products', Visitors: 950, PageViews: 1400, BounceRate: 28.5, AvgTimeOnPage: 120, Conversions: 65, ConversionRate: 6.8, Source: 'Direct', Device: 'Mobile', Browser: 'Safari', Country: 'United States', City: 'Los Angeles', NewUsers: 620, ReturningUsers: 330 },
      { id: '3', Date: '2023-01-01', Page: '/about', Visitors: 450, PageViews: 520, BounceRate: 65.3, AvgTimeOnPage: 45, Conversions: 5, ConversionRate: 1.1, Source: 'Social Media', Device: 'Tablet', Browser: 'Firefox', Country: 'Canada', City: 'Toronto', NewUsers: 380, ReturningUsers: 70 },
      { id: '4', Date: '2023-01-02', Page: '/', Visitors: 1320, PageViews: 1950, BounceRate: 33.8, AvgTimeOnPage: 80, Conversions: 52, ConversionRate: 3.9, Source: 'Organic Search', Device: 'Desktop', Browser: 'Chrome', Country: 'United States', City: 'Chicago', NewUsers: 890, ReturningUsers: 430 },
      { id: '5', Date: '2023-01-02', Page: '/products', Visitors: 1050, PageViews: 1600, BounceRate: 26.2, AvgTimeOnPage: 135, Conversions: 78, ConversionRate: 7.4, Source: 'Paid Search', Device: 'Mobile', Browser: 'Chrome', Country: 'United Kingdom', City: 'London', NewUsers: 680, ReturningUsers: 370 }
    ]
  }
};

// Current authenticated user (will be set by the mock auth service)
// This is now handled by window.currentMockUser in mockAuthService.ts
export const getCurrentMockUser = () => {
  return (window as any).currentMockUser;
}; 