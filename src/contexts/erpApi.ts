const ERP_URL = "http://192.168.101.185";
const ERP_TOKEN = "token c58cba205fd4536:60b6ce921b1a725";

//OrdersView
export const fetchSalesOrders = async ({
  page = 0,
  pageSize = 20,
  searchQuery = "",
  statusFilter = "All",
  customerId = "",
  sortField = "date",
  sortDir = "desc"
}) => {

  const statusMap: any = {
    Pending: "Draft",
    Processing: "To Deliver and Bill",
    Shipped: "To Deliver",
    Confirmed: "To Bill",
    Delivered: "Completed",
    Cancelled: "Cancelled"
  };

  const filters: any[] = [];

  if (customerId) {
    filters.push(["customer", "=", customerId]);
  }

  if (statusFilter !== "All") {
    const erpStatus = statusMap[statusFilter];
    if (erpStatus) {
      filters.push(["status", "=", erpStatus]);
    }
  }

  if (searchQuery) {
    filters.push(["name", "like", `%${searchQuery}%`]);
  }

  const orderBy =
    sortField === "date"
      ? `transaction_date ${sortDir}`
      : `grand_total ${sortDir}`;

  const params = new URLSearchParams({
    fields: JSON.stringify([
      "name",
      "transaction_date",
      "customer_name",
      "status",
      "grand_total",
      "currency",
      "delivery_date",
      "payment_terms_template",
      "total_qty"
    ]),
    filters: JSON.stringify(filters),
    order_by: orderBy,
    limit_page_length: pageSize.toString(),
    limit_start: (page * pageSize).toString()
  });

  const url = `${ERP_URL}/api/resource/Sales Order?${params}`;

  console.log("📡 API CALL →", url);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: ERP_TOKEN
    }
  });

  const data = await response.json();

  console.log("✅ Sales Orders Response:", data);

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return data.data || [];
};

export const fetchSalesOrderDetail = async (orderName: string) => {

  const url = `${ERP_URL}/api/resource/Sales Order/${orderName}`;

  console.log("📡 API CALL →", url);

  const response = await fetch(url, {
    headers: {
      Authorization: ERP_TOKEN
    }
  });

  const data = await response.json();

  console.log("✅ Sales Order Detail:", data);

  if (!response.ok) {
    throw new Error("Failed to fetch order detail");
  }

  return data.data;
};

export const fetchSalesOrderCount = async () => {

  const url = `${ERP_URL}/api/method/frappe.client.get_count?doctype=Sales%20Order`;

  console.log("📡 API CALL →", url);

  const response = await fetch(url, {
    headers: {
      Authorization: ERP_TOKEN
    }
  });

  const data = await response.json();

  console.log("✅ Sales Order Count:", data);

  return data.message || 0;
};

//InvoicesView
export const fetchSalesInvoices = async ({
  page = 0,
  pageSize = 20,
  searchQuery = "",
  statusFilter = "All",
  customerId = "",
  sortField = "date",
  sortDir = "desc"
}) => {

  const filters: any[] = [["docstatus", "=", 1]];

  if (customerId) {
    filters.push(["customer", "=", customerId]);
  }

  if (statusFilter === "Paid") {
    filters.push(["outstanding_amount", "=", 0]);
  }

  if (statusFilter === "Unpaid") {
    filters.push(["outstanding_amount", ">", 0]);
  }

  if (statusFilter === "Overdue") {
    filters.push(["status", "=", "Overdue"]);
  }

  if (searchQuery) {
    filters.push(["name", "like", `%${searchQuery}%`]);
  }

  const orderByField =
    sortField === "date"
      ? "posting_date"
      : sortField === "total"
      ? "grand_total"
      : "outstanding_amount";

  const orderBy = `${orderByField} ${sortDir}`;

  const params = new URLSearchParams({
    fields: JSON.stringify([
      "name",
      "posting_date",
      "due_date",
      "grand_total",
      "outstanding_amount",
      "paid_amount",
      "status",
      "customer_name",
      "currency"
    ]),
    filters: JSON.stringify(filters),
    order_by: orderBy,
    limit_page_length: pageSize.toString(),
    limit_start: (page * pageSize).toString()
  });

  const url = `${ERP_URL}/api/resource/Sales Invoice?${params}`;

  console.log("📡 Invoice API:", url);

  const response = await fetch(url, {
    headers: {
      Authorization: ERP_TOKEN
    }
  });

  const data = await response.json();

  console.log("✅ Invoice List:", data);

  return data.data || [];
};

export const fetchSalesInvoiceDetail = async (name: string) => {

  const url = `${ERP_URL}/api/resource/Sales Invoice/${name}`;

  console.log("📡 Invoice Detail:", url);

  const response = await fetch(url, {
    headers: {
      Authorization: ERP_TOKEN
    }
  });

  const data = await response.json();

  console.log("✅ Invoice Detail Response:", data);

  return data.data;
};

export const fetchSalesInvoiceCount = async () => {

  const url = `${ERP_URL}/api/method/frappe.client.get_count?doctype=Sales%20Invoice`;

  const response = await fetch(url, {
    headers: {
      Authorization: ERP_TOKEN
    }
  });

  const data = await response.json();

  console.log("✅ Invoice Count:", data);

  return data.message || 0;
};

//PaymentsView
// PaymentsView
export const fetchPayments = async ({
  page = 0,
  pageSize = 20,
  searchQuery = "",
  customerId = "",
  sortDir = "desc"
}) => {

  const filters: any[] = [
    ["docstatus", "=", 1],
    ["payment_type", "=", "Receive"]
  ];

  if (customerId) {
    filters.push(["party", "=", customerId]);
  }

  if (searchQuery) {
    filters.push(["name", "like", `%${searchQuery}%`]);
  }

  const orderBy = `posting_date ${sortDir}`;

  const params = new URLSearchParams({
    fields: JSON.stringify([
      "name",
      "posting_date",
      "paid_amount",
      "mode_of_payment",
      "reference_no",
      "status",
      "party_name",
      "docstatus",
      "paid_from_account_currency"
    ]),
    filters: JSON.stringify(filters),
    order_by: orderBy,
    limit_page_length: pageSize.toString(),
    limit_start: (page * pageSize).toString()
  });

  const url = `${ERP_URL}/api/resource/Payment Entry?${params}`;

  console.log("📡 Payments API CALL →", url);

  const response = await fetch(url, {
    headers: {
      Authorization: ERP_TOKEN
    }
  });

  const data = await response.json();

  console.log("✅ Payments Response:", data);

  if (!response.ok) {
    throw new Error("Failed to fetch payments");
  }

  return data.data || [];
};

export const fetchPaymentDetail = async (paymentName: string) => {

  const url = `${ERP_URL}/api/resource/Payment Entry/${paymentName}`;

  console.log("📡 Payment Detail API →", url);

  const response = await fetch(url, {
    headers: {
      Authorization: ERP_TOKEN
    }
  });

  const data = await response.json();

  console.log("✅ Payment Detail:", data);

  if (!response.ok) {
    throw new Error("Failed to fetch payment detail");
  }

  return data.data;
};

export const fetchPaymentCount = async () => {

  const url = `${ERP_URL}/api/method/frappe.client.get_count?doctype=Payment%20Entry`;

  console.log("📡 Payment Count API →", url);

  const response = await fetch(url, {
    headers: {
      Authorization: ERP_TOKEN
    }
  });

  const data = await response.json();

  console.log("✅ Payment Count:", data);

  return data.message || 0;
};