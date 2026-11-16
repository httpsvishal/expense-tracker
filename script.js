const expenseForm = document.getElementById('expenseForm');
const nameInput = document.getElementById('expenseName');
const amountInput = document.getElementById('expenseAmount');
const categoryInput = document.getElementById('expenseCategory');
const expenseList = document.getElementById('expenseList');
const totalAmount = document.getElementById('totalAmount');
const expenseCount = document.getElementById('expenseCount');
const categoryFilter = document.getElementById('categoryFilter');
const formMessage = document.getElementById('formMessage');

const categoryIcons = {
  Food: '🍽️',
  Travel: '🚕',
  Shopping: '🛍️',
  Bills: '🧾',
  Education: '📚',
  Other: '✨'
};

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

document.getElementById('today').textContent = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
}).format(new Date());

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

function updateSummary() {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  totalAmount.textContent = formatCurrency(total);
  expenseCount.textContent = expenses.length;
}

function renderExpenses() {
  const selectedCategory = categoryFilter.value;
  const filteredExpenses = selectedCategory === 'All'
    ? expenses
    : expenses.filter(expense => expense.category === selectedCategory);

  expenseList.innerHTML = '';

  if (filteredExpenses.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <div class="empty-icon">↗</div>
      <h3>${expenses.length === 0 ? 'No expenses yet' : 'No matching expenses'}</h3>
      <p>${expenses.length === 0 ? 'Add your first expense to get started.' : 'Try selecting another category.'}</p>
    `;
    expenseList.appendChild(empty);
  } else {
    filteredExpenses.slice().reverse().forEach(expense => {
      const item = document.createElement('article');
      item.className = 'expense-item';

      const icon = document.createElement('div');
      icon.className = 'category-icon';
      icon.textContent = categoryIcons[expense.category] || '✨';

      const info = document.createElement('div');
      info.className = 'expense-info';
      const title = document.createElement('h3');
      title.textContent = expense.name;
      const meta = document.createElement('p');
      meta.textContent = `${expense.category} · ${expense.date}`;
      info.append(title, meta);

      const right = document.createElement('div');
      right.className = 'expense-right';
      const amount = document.createElement('span');
      amount.className = 'expense-amount';
      amount.textContent = formatCurrency(expense.amount);

      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-button';
      deleteButton.type = 'button';
      deleteButton.textContent = '×';
      deleteButton.setAttribute('aria-label', `Delete ${expense.name}`);
      deleteButton.addEventListener('click', () => deleteExpense(expense.id));

      right.append(amount, deleteButton);
      item.append(icon, info, right);
      expenseList.appendChild(item);
    });
  }

  updateSummary();
}

function deleteExpense(id) {
  expenses = expenses.filter(expense => expense.id !== id);
  saveExpenses();
  renderExpenses();
}

expenseForm.addEventListener('submit', event => {
  event.preventDefault();
  formMessage.textContent = '';

  const name = nameInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;

  if (!name || !category || !Number.isFinite(amount) || amount <= 0) {
    formMessage.textContent = 'Please enter a name, valid amount and category.';
    return;
  }

  expenses.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    amount,
    category,
    date: new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date())
  });

  saveExpenses();
  renderExpenses();
  expenseForm.reset();
  formMessage.style.color = '#1f7656';
  formMessage.textContent = 'Expense added successfully!';
  nameInput.focus();
});

categoryFilter.addEventListener('change', renderExpenses);

renderExpenses();
