const MONTHLY_BUDGET = 200;

const initialExpenses = [
    { id: 1, name: "Groceries", amount: 45.00, category: "Food", date: "2026-06-20" },
    { id: 2, name: "Bus Fare", amount: 5.00, category: "Transport", date: "2026-06-21" },
    { id: 3, name: "Netflix", amount: 12.00, category: "Entertainment", date: "2026-06-22" }
];

let expenses = [...initialExpenses];
let nextId = 4;

const expenseForm = document.getElementById("expense-form");
const nameInput = document.getElementById("expense-name");
const amountInput = document.getElementById("expense-amount");
const categoryInput = document.getElementById("expense-category");
const dateInput = document.getElementById("expense-date");
const categoryFilter = document.getElementById("category-filter");
const clearBtn = document.getElementById("clear-btn");

const tableBody = document.getElementById("expense-table-body");
const monthlyBudgetEl = document.getElementById("monthly-budget");
const totalSpentEl = document.getElementById("total-spent");
const remainingBudgetEl = document.getElementById("remaining-budget");
const budgetStatusEl = document.getElementById("budget-status");
const feedbackEl = document.getElementById("feedback-message");

function evaluateBudgetStatus(totalSpent) {
    const remaining = MONTHLY_BUDGET - totalSpent;
    const usageRatio = totalSpent / MONTHLY_BUDGET;

    if (totalSpent > MONTHLY_BUDGET) {
        return {
            text: `Over budget by $${Math.abs(remaining).toFixed(2)}! Review your expenses.`,
            cssClass: "danger"
        };
    } else if (usageRatio >= 0.8) {
        return {
            text: `Budget warning: $${remaining.toFixed(2)} left (${Math.round(usageRatio * 100)}% used).`,
            cssClass: "warning"
        };
    } else {
        return {
            text: `On track: $${remaining.toFixed(2)} remaining out of $${MONTHLY_BUDGET.toFixed(2)}.`,
            cssClass: ""
        };
    }
}

function getFilteredExpenses(selectedCategory) {
    if (selectedCategory === "All") {
        return expenses;
    }

    const filtered = [];
    for (let i = 0; i < expenses.length; i++) {
        if (expenses[i].category === selectedCategory) {
            filtered.push(expenses[i]);
        }
    }
    return filtered;
}

function calculateTotalSpent() {
    let sum = 0;
    for (let i = 0; i < expenses.length; i++) {
        sum += expenses[i].amount;
    }
    return sum;
}

function renderDashboard() {
    const selectedCategory = categoryFilter.value;
    const visibleExpenses = getFilteredExpenses(selectedCategory);
    const totalSpent = calculateTotalSpent();
    const remaining = MONTHLY_BUDGET - totalSpent;
    const status = evaluateBudgetStatus(totalSpent);

    monthlyBudgetEl.textContent = `$${MONTHLY_BUDGET.toFixed(2)}`;
    totalSpentEl.textContent = `$${totalSpent.toFixed(2)}`;
    remainingBudgetEl.textContent = `$${remaining.toFixed(2)}`;

    budgetStatusEl.textContent = status.text;
    budgetStatusEl.className = "status-banner";
    if (status.cssClass) {
        budgetStatusEl.classList.add(status.cssClass);
    }

    tableBody.textContent = "";

    if (visibleExpenses.length === 0) {
        const emptyRow = document.createElement("tr");
        const emptyCell = document.createElement("td");
        emptyCell.colSpan = 5;
        emptyCell.textContent = `No expenses found for category "${selectedCategory}".`;
        emptyRow.appendChild(emptyCell);
        tableBody.appendChild(emptyRow);
        return;
    }

    for (let i = 0; i < visibleExpenses.length; i++) {
        const item = visibleExpenses[i];
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = item.name;

        const amountCell = document.createElement("td");
        amountCell.textContent = `$${item.amount.toFixed(2)}`;

        const categoryCell = document.createElement("td");
        categoryCell.textContent = item.category;

        const dateCell = document.createElement("td");
        dateCell.textContent = item.date;

        const actionCell = document.createElement("td");
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.dataset.id = String(item.id);
        actionCell.appendChild(deleteBtn);

        row.appendChild(nameCell);
        row.appendChild(amountCell);
        row.appendChild(categoryCell);
        row.appendChild(dateCell);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    }
}

function showFeedback(message, isError = false) {
    feedbackEl.textContent = message;
    feedbackEl.className = isError ? "feedback error" : "feedback";
}

expenseForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!name || Number.isNaN(amount) || amount <= 0 || !date) {
        showFeedback("Please enter a valid expense name, positive amount, and date.", true);
        return;
    }

    const newExpense = {
        id: nextId,
        name: name,
        amount: amount,
        category: category,
        date: date
    };

    expenses.push(newExpense);
    nextId++;

    renderDashboard();
    expenseForm.reset();
    dateInput.value = "2026-06-23";

    if (amount >= 50) {
        showFeedback(`Added large expense "${name}" ($${amount.toFixed(2)}).`);
    } else {
        showFeedback(`Added "${name}" ($${amount.toFixed(2)}) to ${category}.`);
    }
});

categoryFilter.addEventListener("change", () => {
    renderDashboard();
});

tableBody.addEventListener("click", (event) => {
    const deleteBtn = event.target.closest(".delete-btn");
    if (!deleteBtn) {
        return;
    }

    const targetId = Number(deleteBtn.dataset.id);
    if (Number.isNaN(targetId)) {
        showFeedback("Could not identify the expense to delete.", true);
        return;
    }

    const updatedExpenses = [];
    let found = false;

    for (let i = 0; i < expenses.length; i++) {
        if (expenses[i].id === targetId) {
            found = true;
        } else {
            updatedExpenses.push(expenses[i]);
        }
    }

    if (!found) {
        showFeedback("Expense was not found.", true);
        return;
    }

    expenses = updatedExpenses;
    renderDashboard();
    showFeedback("Expense deleted.");
});

clearBtn.addEventListener("click", () => {
    expenses = [...initialExpenses];
    categoryFilter.value = "All";
    renderDashboard();
    showFeedback("Reset to initial sample expenses.");
});

renderDashboard();
