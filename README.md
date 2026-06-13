<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/035eec49-d5a2-4777-b1a6-506880163c09" />
<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/2a09fd3f-8908-4dc8-9049-f5542517c2ca" />

# 🛒 SwiftPOS

Modern Retail Management System built with React, Laravel, and MySQL.

SwiftPOS is a complete retail platform that combines Point of Sale (POS), Inventory Management, Procurement, Customer Relationship Management (CRM), Costing, Audit Trails, and Business Analytics into a single application.

---

## ✨ Features

### 🛍️ Point of Sale

- Fast checkout workflow
- Product search & variants
- Multiple payment methods
  - Cash
  - QRIS
  - Bank Transfer

- Invoice generation
- Transaction history
- Automatic stock deduction
- Real-time stock refresh
- Stock validation
- Out-of-stock protection

### 📦 Inventory Management

- Real-time stock tracking
- Stock adjustment
- Inventory logs
- Inventory movement history
- Stock Opname
- Low stock monitoring
- Out-of-stock alerts
- Product stock history
- Purchase history
- Sales history
- Inventory audit trail
- Inventory valuation

### 💰 Costing & Valuation

- Weighted Average Cost (HPP)
- Automatic Cost Recalculation
- Inventory Valuation Reports
- Inventory Asset Tracking
- Purchase Cost Tracking
- Product-Level Cost Visibility

### 📋 Procurement

- Supplier management
- Supplier analytics
- Purchase Orders
- Purchase Order Detail
- Partial Receiving
- Full Receiving
- Purchase Order Cancellation
- Inventory integration
- Purchase analytics
- Purchase history tracking

Purchase Order Workflow:

```text
Supplier
    ↓
Purchase Order
    ↓
Receive Stock
    ↓
Inventory
    ↓
Inventory Logs
    ↓
Average Cost Recalculation
```

Supported Purchase Order Status:

```text
Draft
Pending
Partial
Completed
Cancelled
```

### 🛍️ Product Management

- Product CRUD
- Categories
- Product Variants
- SKU Support
- Product Images
- CSV Import
- Product Detail Page
- Advanced Filtering
- Pagination
- Product Analytics
- Product Purchase History
- Product Sales History
- Product Inventory Logs

### 👥 CRM & Customers

- Customer Management
- Customer Detail
- Purchase History
- Customer Analytics
- Customer Segmentation
- Top Customers
- Customer Spending Reports

### 📊 Reports & Analytics

- Revenue Analytics
- Profit Analytics
- Revenue Trend
- Profit Trend
- Top Products
- Top Customers
- Category Analytics
- Payment Method Analytics
- Transaction Reports
- Inventory Valuation Reports
- Purchase Analytics
- Product Performance Analytics

### 📜 Audit & Traceability

- Activity Logs
- Inventory Movement Logs
- Product Stock History
- Product Purchase History
- Product Sales History
- Purchase Order Tracking
- Purchase Order Activity Tracking
- Inventory Audit Trail

### 🔐 Authentication & Security

- Login System
- Role-Based Access Control
- Permission Management
- Protected Routes
- Laravel Policies
- Store-Level Data Isolation

Inventory Protection Rules:

```text
Stock can only be changed through:

✓ Inventory Restock
✓ Inventory Adjustment
✓ Purchase Order Receiving
✓ POS Transactions

Not through:

✗ Product Edit
```

### 🎨 UI & Experience

- Responsive Design
- Dark Mode
- Theme Customization
- Dashboard Widgets
- Interactive Charts
- Modern Card-Based Interface
- Alert Dialog Confirmations
- Toast Notifications

---

## 🖼️ Preview

### Dashboard & Analytics

<img width="1920" height="911" alt="Dashboard Overview" src="https://github.com/user-attachments/assets/035eec49-d5a2-4777-b1a6-506880163c09" />

<img width="1920" height="911" alt="Inventory Valuation Dashboard" src="https://github.com/user-attachments/assets/2a09fd3f-8908-4dc8-9049-f5542517c2ca" />

### Core Modules

<img width="1920" height="1461" alt="Dashboard" src="https://github.com/user-attachments/assets/4dd228d2-53c6-4d8b-a85c-ec0a238b309e" />

<img width="1920" height="1183" alt="Products Management" src="https://github.com/user-attachments/assets/4f5dc11e-6003-4f14-bf4a-975325e37408" />

<img width="1920" height="1595" alt="Product Detail" src="https://github.com/user-attachments/assets/a6d0f6ed-2cae-490e-9d0f-60b9ed89e21f" />

<img width="1920" height="1080" alt="Inventory Management" src="https://github.com/user-attachments/assets/0592cf5a-c63b-40e9-a387-ba813ffa08fd" />

<img width="1920" height="1080" alt="Inventory Logs" src="https://github.com/user-attachments/assets/b79e760c-6dce-4b65-8cce-358b1da0793c" />

<img width="1920" height="1080" alt="Purchase Orders" src="https://github.com/user-attachments/assets/379c53f8-a444-4b8c-bca8-9996242a8211" />

<img width="1920" height="1080" alt="Purchase Order Detail" src="https://github.com/user-attachments/assets/c6c7ce6e-7241-406e-b22a-6a52e19b4521" />

<img width="1920" height="1080" alt="Suppliers" src="https://github.com/user-attachments/assets/5f3b64d2-2bd3-4153-a093-2144a17a288e" />

<img width="1920" height="1080" alt="Customers" src="https://github.com/user-attachments/assets/13bc05e7-39b3-4e3c-9118-fa5df7968179" />

<img width="1920" height="1080" alt="Customer Detail Analytics" src="https://github.com/user-attachments/assets/1a0a5fe5-9afd-4c34-840c-da4d249fdf1a" />

<img width="1920" height="1080" alt="Reports Analytics" src="https://github.com/user-attachments/assets/c5300343-168f-4793-b970-fe8249e87511" />

<img width="1920" height="1080" alt="Revenue & Profit Reports" src="https://github.com/user-attachments/assets/fd07396d-b48b-4f3d-a7d4-eed0d7f9b4d6" />

<img width="1920" height="1080" alt="Activity Logs" src="https://github.com/user-attachments/assets/01fb2841-e10e-4419-ae6a-2b34e9d71da7" />

<img width="1920" height="2934" alt="Mobile Responsive Layout" src="https://github.com/user-attachments/assets/d29003b4-1e95-4b08-9af9-d22608bf8d75" />

<img width="1920" height="1485" alt="Inventory Valuation Report" src="https://github.com/user-attachments/assets/98b5eba5-1eaa-49ef-87a9-2c2b9d8f9c6f" />

<img width="1920" height="1049" alt="Stock Opname & Costing" src="https://github.com/user-attachments/assets/59f1eca8-c38d-4b65-adc6-073d52f6bbb7" />

---

## ⚙️ Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- Lucide React
- Sonner

### Backend

- Laravel 12
- Laravel Sanctum
- Spatie Permission
- MySQL

---

## 🚀 Installation

### Backend

```bash
git clone https://github.com/cakramhndr/swift-pos-api.git

cd swift-pos-api

composer install

cp .env.example .env

php artisan key:generate

php artisan migrate --seed

php artisan serve
```

Backend:

```text
http://127.0.0.1:8000
```

---

### Frontend

```bash
git clone https://github.com/cakramhndr/swift-pos-web.git

cd swift-pos-web

npm install

npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 📁 Architecture

```text
React Frontend
      ↓
Laravel API
      ↓
MySQL Database
```

---

## 📌 Current Status

### Completed ✅

- Authentication
- Roles & Permissions
- Dashboard
- Products
- Categories
- Customers
- Suppliers
- POS System
- Transactions
- Inventory Management
- Inventory Logs
- Stock Opname
- Average Cost Recalculation (HPP)
- Inventory Valuation
- CRM
- Reports Premium
- Product Analytics
- Purchase Analytics
- Activity Logs
- Purchase Orders
- Purchase Order Cancellation
- Partial Receiving
- Full Receiving
- Inventory Integration
- Product Purchase History
- Product Sales History

### In Progress 🚧

- Purchase Order PDF Printing
- Thermal Receipt Printing
- Export Activity Logs
- Export Inventory Logs

---

## 🚧 Roadmap

### Short Term

- Purchase Order PDF Printing
- Export Activity Logs
- Export Inventory Logs
- Supplier Delete Protection

### Security & Access

- Advanced Role Permissions
- Approval Workflow

### Multi Store

- Branch Management
- Inter-Store Transfers
- Branch Reporting

### Advanced Inventory

- FIFO Costing
- Batch Tracking
- FEFO
- Expiry Date Tracking
- Lot Number Tracking
- Serial Number Tracking

### Retail Features

- Thermal Receipt Printing
- Barcode Scanner
- Mobile Application

### Enterprise

- Accounting Module
- General Ledger
- Financial Statements
- Marketplace Integration

---

## 👨‍💻 Author

Made with ❤️ by Cakra

GitHub:
https://github.com/cakramhndr
