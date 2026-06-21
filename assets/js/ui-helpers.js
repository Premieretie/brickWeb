/**
 * Shared UI helpers: notifications, loading states, empty states, formatting.
 */
(function() {
    'use strict';

    function showToast(message, type = 'info') {
        const existing = document.querySelector('.bq-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `bq-toast bq-toast--${type}`;
        toast.setAttribute('role', 'status');
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('bq-toast--visible'));

        setTimeout(() => {
            toast.classList.remove('bq-toast--visible');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function showLoading(form) {
        const button = form.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.textContent = 'Loading...';
        }
    }

    function hideLoading(form) {
        const button = form.querySelector('button[type="submit"]');
        if (button && button.dataset.originalText) {
            button.disabled = false;
            button.textContent = button.dataset.originalText;
        }
    }

    function renderEmptyState(container, message) {
        container.innerHTML = `<div class="empty-state">${message}</div>`;
    }

    function formatCurrency(value) {
        const num = parseFloat(value);
        if (isNaN(num)) return '-';
        return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(num);
    }

    function formatDate(value) {
        if (!value) return '-';
        const d = new Date(value);
        return d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function slugify(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    window.UI = {
        showToast,
        showLoading,
        hideLoading,
        renderEmptyState,
        formatCurrency,
        formatDate,
        slugify
    };
})();
