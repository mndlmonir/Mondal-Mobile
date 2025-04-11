// ডাটা স্টোরেজ
let products = JSON.parse(localStorage.getItem('products')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];
let bills = JSON.parse(localStorage.getItem('bills')) || [];
let currentBillItems = [];
let editingProductId = null;

// DOM লোড হওয়ার পর ইনিশিয়ালাইজেশন
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // ডিফল্ট ট্যাব সক্রিয় করুন
    switchTab('dashboard');
    
    // প্রোডাক্ট লিস্ট লোড করুন
    renderProducts();
    
    // সেলস লিস্ট লোড করুন
    renderSales();
    
    // সঞ্চিত বিল লোড করুন
    renderSavedBills();
    
    // ড্যাশবোর্ড স্ট্যাট আপডেট করুন
    updateDashboardStats();
    
    // প্রোডাক্ট ফর্ম সাবমিট হ্যান্ডলার
    document.getElementById('product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
}

// ট্যাব সুইচ ফাংশন
function switchTab(tabId) {
    // সব ট্যাব কন্টেন্ট লুকান
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // নির্বাচিত ট্যাব সক্রিয় করুন
    document.getElementById(tabId).classList.add('active');
    
    // সাইডবারের একটিভ আইটেম আপডেট করুন
    document.querySelectorAll('.sidebar li').forEach(item => {
        item.classList.remove('active');
    });
    
    // বর্তমান ট্যাবের লিঙ্ক সক্রিয় করুন
    const activeTabLink = Array.from(document.querySelectorAll('.sidebar li')).find(li => {
        return li.getAttribute('onclick').includes(tabId);
    });
    
    if (activeTabLink) {
        activeTabLink.classList.add('active');
    }
    
    // বিশেষ ট্যাবের জন্য অতিরিক্ত ইনিশিয়ালাইজেশন
    if (tabId === 'new-bill') {
        initNewBill();
    }
}

// প্রোডাক্ট মোডাল দেখান
function showProductModal(productId = null) {
    editingProductId = productId;
    const modal = document.getElementById('product-modal');
    
    if (productId) {
        // এডিট মোড
        document.getElementById('modal-title').textContent = 'প্রোডাক্ট এডিট করুন';
        const product = products.find(p => p.id === productId);
        
        if (product) {
            document.getElementById('modal-product-name').value = product.name;
            document.getElementById('modal-buy-price').value = product.buyPrice;
            document.getElementById('modal-sell-price').value = product.sellPrice;
            document.getElementById('modal-quantity').value = product.quantity;
            document.getElementById('modal-category').value = product.category || 'other';
            document.getElementById('modal-description').value = product.description || '';
        }
    } else {
        // নতুন প্রোডাক্ট মোড
        document.getElementById('modal-title').textContent = 'নতুন প্রোডাক্ট যোগ করুন';
        document.getElementById('product-form').reset();
    }
    
    modal.style.display = 'flex';
}

// মোডাল বন্ধ করুন
function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
    editingProductId = null;
}

// প্রোডাক্ট সেভ করুন
function saveProduct() {
    const product = {
        id: editingProductId || Date.now().toString(),
        name: document.getElementById('modal-product-name').value,
        buyPrice: parseFloat(document.getElementById('modal-buy-price').value),
        sellPrice: parseFloat(document.getElementById('modal-sell-price').value),
        quantity: parseInt(document.getElementById('modal-quantity').value),
        category: document.getElementById('modal-category').value,
        description: document.getElementById('modal-description').value
    };
    
    if (editingProductId) {
        // প্রোডাক্ট আপডেট করুন
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            products[index] = product;
        }
    } else {
        // নতুন প্রোডাক্ট যোগ করুন
        products.push(product);
    }
    
    saveProducts();
    renderProducts();
    closeModal();
    
    // নতুন বিল ট্যাবের প্রোডাক্ট লিস্ট আপডেট করুন
    if (document.getElementById('new-bill').classList.contains('active')) {
        initNewBill();
    }
}

// প্রোডাক্ট ডিলিট করুন
function deleteProduct(productId) {
    if (confirm('আপনি কি এই প্রোডাক্ট ডিলিট করতে চান?')) {
        products = products.filter(product => product.id !== productId);
        saveProducts();
        renderProducts();
        
        // নতুন বিল ট্যাবের প্রোডাক্ট লিস্ট আপডেট করুন
        if (document.getElementById('new-bill').classList.contains('active')) {
            initNewBill();
        }
    }
}

// প্রোডাক্ট লিস্ট রেন্ডার করুন
function renderProducts() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.name}</td>
            <td>₹${product.buyPrice.toFixed(2)}</td>
            <td>₹${product.sellPrice.toFixed(2)}</td>
            <td class="${product.quantity < 5 ? 'low-stock' : ''}">${product.quantity}</td>
            <td>
                <button class="btn-icon" onclick="showProductModal('${product.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        productList.appendChild(row);
    });
}

// নতুন বিল ইনিশিয়ালাইজেশন
function initNewBill() {
    const billProductSelect = document.getElementById('bill-product');
    billProductSelect.innerHTML = '<option value="">প্রোডাক্ট নির্বাচন করুন</option>';
    
    products.forEach(product => {
        if (product.quantity > 0) {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (স্টক: ${product.quantity})`;
            billProductSelect.appendChild(option);
        }
    });
    
    // বিল তারিখ সেট করুন
    document.getElementById('bill-date').valueAsDate = new Date();
}

// বিলে আইটেম যোগ করুন
function addToBill() {
    const productId = document.getElementById('bill-product').value;
    const quantity = parseInt(document.getElementById('bill-quantity').value);
    
    if (!productId || !quantity || quantity < 1) {
        alert('দয়া করে সঠিক প্রোডাক্ট এবং পরিমাণ নির্বাচন করুন');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (quantity > product.quantity) {
        alert('স্টকে পর্যাপ্ত প্রোডাক্ট নেই');
        return;
    }
    
    // চেক করুন আইটেমটি ইতিমধ্যে বিলে আছে কিনা
    const existingItem = currentBillItems.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        currentBillItems.push({
            productId,
            productName: product.name,
            buyPrice: product.buyPrice,
            sellPrice: product.sellPrice,
            quantity
        });
    }
    
    // স্টক আপডেট করুন (অস্থায়ীভাবে)
    product.quantity -= quantity;
    
    renderBillItems();
    document.getElementById('bill-quantity').value = 1;
}

// বিল আইটেম রেন্ডার করুন
function renderBillItems() {
    const billItemsList = document.getElementById('bill-items-list');
    billItemsList.innerHTML = '';
    
    let total = 0;
    
    currentBillItems.forEach((item, index) => {
        const row = document.createElement('tr');
        const itemTotal = item.quantity * item.sellPrice;
        total += itemTotal;
        
        row.innerHTML = `
            <td>${item.productName}</td>
            <td>₹${item.sellPrice.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>₹${itemTotal.toFixed(2)}</td>
            <td>
                <button class="btn-icon btn-danger" onclick="removeBillItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        billItemsList.appendChild(row);
    });
    
    document.getElementById('bill-total-amount').textContent = total.toFixed(2);
}

// বিল থেকে আইটেম রিমুভ করুন
function removeBillItem(index) {
    const removedItem = currentBillItems.splice(index, 1)[0];
    
    // স্টক ফেরত দিন
    const product = products.find(p => p.id === removedItem.productId);
    if (product) {
        product.quantity += removedItem.quantity;
    }
    
    renderBillItems();
}

// বিল সেভ করুন
function saveBill() {
    if (currentBillItems.length === 0) {
        alert('বিলে কোনো আইটেম যোগ করা হয়নি');
        return;
    }
    
    const customerName = document.getElementById('customer-name').value || 'Anonymous';
    const billDate = document.getElementById('bill-date').value || new Date().toISOString().split('T')[0];
    
    const bill = {
        id: 'BILL-' + Date.now().toString().slice(-6),
        customerName,
        date: billDate,
        items: [...currentBillItems],
        total: parseFloat(document.getElementById('bill-total-amount').textContent)
    };
    
    // সেলস রেকর্ড যোগ করুন
    currentBillItems.forEach(item => {
        sales.push({
            id: Date.now().toString(),
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            buyPrice: item.buyPrice,
            sellPrice: item.sellPrice,
            date: new Date().toISOString()
        });
    });
    
    bills.push(bill);
    
    // ডাটা সেভ করুন
    saveProducts();
    saveSales();
    saveBills();
    
    // বিল ক্লিয়ার করুন
    clearBill();
    
    // লিস্ট আপডেট করুন
    renderSales();
    renderSavedBills();
    updateDashboardStats();
    
    alert('বিল সফলভাবে সেভ করা হয়েছে');
}

// বিল প্রিন্ট করুন
function printBill() {
    // এখানে প্রিন্ট ফাংশনালিটি যোগ করুন
    alert('প্রিন্ট ফাংশনালিটি ইমপ্লিমেন্ট করুন');
}

// বিল ক্লিয়ার করুন
function clearBill() {
    currentBillItems = [];
    document.getElementById('customer-name').value = '';
    document.getElementById('bill-date').valueAsDate = new Date();
    document.getElementById('bill-items-list').innerHTML = '';
    document.getElementById('bill-total-amount').textContent = '0';
    
    // প্রোডাক্ট সিলেক্ট রিফ্রেশ করুন
    initNewBill();
}

// সেলস লিস্ট রেন্ডার করুন
function renderSales() {
    const salesList = document.getElementById('sales-list');
    salesList.innerHTML = '';
    
    sales.forEach(sale => {
        const row = document.createElement('tr');
        const total = sale.quantity * sale.sellPrice;
        const profit = sale.quantity * (sale.sellPrice - sale.buyPrice);
        
        row.innerHTML = `
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td>${sale.productName}</td>
            <td>${sale.quantity}</td>
            <td>₹${total.toFixed(2)}</td>
            <td>₹${profit.toFixed(2)}</td>
        `;
        
        salesList.appendChild(row);
    });
}

// সঞ্চিত বিল রেন্ডার করুন
function renderSavedBills() {
    const savedBillsList = document.getElementById('saved-bills-list');
    savedBillsList.innerHTML = '';
    
    bills.forEach(bill => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${bill.id}</td>
            <td>${bill.customerName}</td>
            <td>${bill.date}</td>
            <td>₹${bill.total.toFixed(2)}</td>
            <td>
                <button class="btn-icon" onclick="viewBill('${bill.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        savedBillsList.appendChild(row);
    });
}

// বিল দেখুন
function viewBill(billId) {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;
    
    alert(`বিল নম্বর: ${bill.id}\nগ্রাহক: ${bill.customerName}\nমোট: ₹${bill.total.toFixed(2)}`);
}

// রিপোর্ট জেনারেট করুন
function generateReport() {
    const fromDate = document.getElementById('report-from-date').value;
    const toDate = document.getElementById('report-to-date').value;
    
    let filteredSales = [...sales];
    
    if (fromDate) {
        filteredSales = filteredSales.filter(sale => new Date(sale.date) >= new Date(fromDate));
    }
    
    if (toDate) {
        filteredSales = filteredSales.filter(sale => new Date(sale.date) <= new Date(toDate));
    }
    
    // রিপোর্ট লিস্ট রেন্ডার করুন
    const reportList = document.getElementById('report-list');
    reportList.innerHTML = '';
    
    let totalSales = 0;
    let totalProfit = 0;
    let totalSold = 0;
    
    filteredSales.forEach(sale => {
        const row = document.createElement('tr');
        const total = sale.quantity * sale.sellPrice;
        const profit = sale.quantity * (sale.sellPrice - sale.buyPrice);
        
        totalSales += total;
        totalProfit += profit;
        totalSold += sale.quantity;
        
        row.innerHTML = `
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td>${sale.productName}</td>
            <td>${sale.quantity}</td>
            <td>₹${total.toFixed(2)}</td>
            <td>₹${profit.toFixed(2)}</td>
        `;
        
        reportList.appendChild(row);
    });
    
    // সামারি আপডেট করুন
    document.getElementById('total-sales').textContent = `₹${totalSales.toFixed(2)}`;
    document.getElementById('total-profit').textContent = `₹${totalProfit.toFixed(2)}`;
    document.getElementById('total-sold').textContent = totalSold;
}

// ড্যাশবোর্ড স্ট্যাট আপডেট করুন
function updateDashboardStats() {
    const today = new Date().toLocaleDateString();
    const todaySales = sales.filter(sale => {
        return new Date(sale.date).toLocaleDateString() === today;
    });
    
    const todaySalesAmount = todaySales.reduce((sum, sale) => {
        return sum + (sale.quantity * sale.sellPrice);
    }, 0);
    
    const todayProfit = todaySales.reduce((sum, sale) => {
        return sum + (sale.quantity * (sale.sellPrice - sale.buyPrice));
    }, 0);
    
    document.getElementById('today-sales').textContent = `₹${todaySalesAmount.toFixed(2)}`;
    document.getElementById('today-profit').textContent = `₹${todayProfit.toFixed(2)}`;
    document.getElementById('total-products').textContent = products.length;
}

// লোকাল স্টোরেজে ডাটা সেভ করুন
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

function saveSales() {
    localStorage.setItem('sales', JSON.stringify(sales));
}

function saveBills() {
    localStorage.setItem('bills', JSON.stringify(bills));
}
// বিল প্রিন্ট করুন
function printBill() {
    if (currentBillItems.length === 0) {
        alert('প্রিন্ট করার জন্য কোনো বিল আইটেম নেই');
        return;
    }

    const customerName = document.getElementById('customer-name').value || 'Anonymous';
    const billDate = document.getElementById('bill-date').value || new Date().toISOString().split('T')[0];
    const billId = 'BILL-' + Date.now().toString().slice(-6);
    const totalAmount = document.getElementById('bill-total-amount').textContent;

    // প্রিন্টযোগ্য বিল HTML তৈরি করুন
    const printContent = `
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>বিল প্রিন্ট</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .print-container { max-width: 300px; margin: 0 auto; }
                .shop-header { text-align: center; margin-bottom: 15px; }
                .shop-name { font-size: 20px; font-weight: bold; }
                .shop-address { font-size: 12px; margin: 5px 0; }
                .bill-info { display: flex; justify-content: space-between; margin: 10px 0; }
                .bill-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                .bill-table th, .bill-table td { padding: 5px; border-bottom: 1px dashed #ddd; }
                .bill-table th { text-align: left; }
                .bill-table td:last-child { text-align: right; }
                .total-amount { font-weight: bold; text-align: right; margin-top: 10px; }
                .thank-you { text-align: center; margin-top: 20px; font-style: italic; }
                .footer { text-align: center; margin-top: 30px; font-size: 10px; }
                @media print {
                    .no-print { display: none !important; }
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="print-container">
                <div class="shop-header">
                    <div class="shop-name">Mondal Mobile Accessories</div>
                    <div class="shop-address">গদার পাড়, বিটরা রোড, পূর্ব বর্ধমান
 </div>
                    <div class="shop-phone">ফোন: 7001902533 </div>
                </div>
                
                <div class="bill-info">
                    <div>বিল নং: ${billId}</div>
                    <div>তারিখ: ${billDate}</div>
                </div>
                
                <div class="bill-info">
                    <div>গ্রাহক: ${customerName}</div>
                </div>
                
                <table class="bill-table">
                    <thead>
                        <tr>
                            <th>আইটেম</th>
                            <th>দাম</th>
                            <th>পরিমাণ</th>
                            <th>মোট</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${currentBillItems.map(item => `
                            <tr>
                                <td>${item.productName}</td>
                                <td>₹${item.sellPrice.toFixed(2)}</td>
                                <td>${item.quantity}</td>
                                <td>₹${(item.quantity * item.sellPrice).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="total-amount">
                    মোট টাকা: ₹${totalAmount}
                </div>
                
                <div class="thank-you">ধন্যবাদান্তে</div>
                
                <div class="footer">
                    <div>*** বিক্রিত পণ্য ফেরত গ্রহণযোগ্য নয় ***</div>
                    <div>সফটওয়্যার দ্বারা পরিচালিত - মোবাইল এক্সেসরিজ শপ</div>
                </div>
                
                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #4361ee; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        প্রিন্ট করুন
                    </button>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #ff0066; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                        বন্ধ করুন
                    </button>
                </div>
            </div>
            
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `;

    // নতুন উইন্ডো খুলে প্রিন্টযোগ্য বিল দেখান
    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
}