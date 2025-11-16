// DOM Elements
const invoiceForm = document.getElementById('invoiceForm');
const formSection = document.getElementById('formSection');
const invoiceSection = document.getElementById('invoiceSection');
const resetBtn = document.getElementById('resetBtn');
const backBtn = document.getElementById('backBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Form Input Elements
const flatNumberInput = document.getElementById('flatNumber');
const invoiceDateInput = document.getElementById('invoiceDate');
const fromMonthInput = document.getElementById('fromMonth');
const toMonthInput = document.getElementById('toMonth');
const maintenanceFeeInput = document.getElementById('maintenanceFee');
const lateFeeInput = document.getElementById('lateFee');
const extraChargesInput = document.getElementById('extraCharges');
const totalFeesInput = document.getElementById('totalFees');
// Signature is now fixed - no upload needed

// Invoice Display Elements
const displayFlatNumber = document.getElementById('displayFlatNumber');
const displayDate = document.getElementById('displayDate');
const displayFromMonth = document.getElementById('displayFromMonth');
const displayToMonth = document.getElementById('displayToMonth');
const displayTotalRupees = document.getElementById('displayTotalRupees');
const displayMaintenanceFee = document.getElementById('displayMaintenanceFee');
const displayLateFee = document.getElementById('displayLateFee');
const displayExtraCharges = document.getElementById('displayExtraCharges');
const displayTotalFees = document.getElementById('displayTotalFees');
const displaySignature = document.getElementById('displaySignature');

// Signature is now embedded as base64 in HTML

// Initialize - Set today's date
invoiceDateInput.valueAsDate = new Date();

// Real-time Total Calculation
function calculateTotal() {
    const maintenance = parseFloat(maintenanceFeeInput.value) || 0;
    const lateFee = parseFloat(lateFeeInput.value) || 0;
    const extraCharges = parseFloat(extraChargesInput.value) || 0;
    
    const total = maintenance + lateFee + extraCharges;
    totalFeesInput.value = total.toFixed(2);
}

// Add event listeners for real-time calculation
maintenanceFeeInput.addEventListener('input', calculateTotal);
lateFeeInput.addEventListener('input', calculateTotal);
extraChargesInput.addEventListener('input', calculateTotal);

// Signature is now fixed in the invoice template

// Format date to DD/MM/YYYY
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Format month to "MONTH YEAR"
function formatMonth(monthString) {
    const date = new Date(monthString + '-01');
    const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
                       'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

// Format currency
function formatCurrency(amount) {
    return parseFloat(amount).toFixed(1);
}

// Form Submission Handler
invoiceForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate form
    if (!invoiceForm.checkValidity()) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Validate month range
    const fromDate = new Date(fromMonthInput.value);
    const toDate = new Date(toMonthInput.value);
    
    if (toDate < fromDate) {
        alert('Billing "To Month" cannot be before "From Month".');
        return;
    }
    
    // Populate invoice display
    displayFlatNumber.textContent = flatNumberInput.value;
    displayDate.textContent = formatDate(invoiceDateInput.value);
    displayFromMonth.textContent = formatMonth(fromMonthInput.value);
    displayToMonth.textContent = formatMonth(toMonthInput.value);
    
    const maintenance = parseFloat(maintenanceFeeInput.value) || 0;
    const lateFee = parseFloat(lateFeeInput.value) || 0;
    const extraCharges = parseFloat(extraChargesInput.value) || 0;
    const total = maintenance + lateFee + extraCharges;
    
    displayMaintenanceFee.textContent = formatCurrency(maintenance);
    displayLateFee.textContent = formatCurrency(lateFee);
    displayExtraCharges.textContent = formatCurrency(extraCharges);
    displayTotalFees.textContent = formatCurrency(total);
    
    // Signature (SVG) is always visible
    const signature = document.getElementById('displaySignature');
    if (signature) {
        signature.style.display = 'block';
        signature.style.opacity = '1';
    }
    
    // Show invoice, hide form
    formSection.style.display = 'none';
    invoiceSection.style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Reset Form Handler
resetBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
        invoiceForm.reset();
        totalFeesInput.value = '';
        invoiceDateInput.valueAsDate = new Date();
    }
});

// Back to Form Handler
backBtn.addEventListener('click', function() {
    formSection.style.display = 'block';
    invoiceSection.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Download PDF Handler (refactored)
downloadBtn.addEventListener('click', generateInvoicePDF);

function generateInvoicePDF() {
    const invoiceContainer = document.getElementById('invoiceContainer');
    const flatNumber = flatNumberInput.value.replace(/[^a-zA-Z0-9]/g, '');
    const fileName = `Invoice_${flatNumber}_${Date.now()}.pdf`;

    // Loading state
    const originalText = downloadBtn.textContent;
    downloadBtn.textContent = '⏳ Generating PDF...';
    downloadBtn.disabled = true;

    // Apply export class for consistent layout
    invoiceContainer.classList.add('pdf-export');

    // Force reflow to ensure styles applied
    void invoiceContainer.offsetWidth;

    const scaleFactor = 3;

    const opt = {
        margin: 10, // mm
        filename: fileName,
        image: { type: 'png', quality: 1 },
        html2canvas: {
            scale: 4, // Increased for better SVG rendering
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            scrollY: -window.scrollY,
            scrollX: 0,
            allowTaint: false,
            imageTimeout: 15000,
            letterRendering: true,
            removeContainer: false,
            foreignObjectRendering: false,
            svgRendering: true
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: false
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Wait for images to load before generating PDF
    const images = invoiceContainer.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            setTimeout(resolve, 3000); // Timeout after 3s
        });
    });

    Promise.all(imagePromises).then(() => {
        return html2pdf().set(opt).from(invoiceContainer).save();
    }).then(() => {
        downloadBtn.textContent = originalText;
        downloadBtn.disabled = false;
        invoiceContainer.classList.remove('pdf-export');
        setTimeout(() => alert('Invoice downloaded successfully!'), 300);
    }).catch(err => {
        console.error('PDF generation error:', err);
        downloadBtn.textContent = originalText;
        downloadBtn.disabled = false;
        invoiceContainer.classList.remove('pdf-export');
        alert('Error generating PDF. Please try again.');
    });
}

// Signature is now fixed - always visible

// Prevent form submission on Enter key (except for submit button)
invoiceForm.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.type !== 'submit') {
        e.preventDefault();
    }
});

// Auto-save to localStorage (optional feature)
function saveFormData() {
    const formData = {
        flatNumber: flatNumberInput.value,
        invoiceDate: invoiceDateInput.value,
        fromMonth: fromMonthInput.value,
        toMonth: toMonthInput.value,
        maintenanceFee: maintenanceFeeInput.value,
        lateFee: lateFeeInput.value,
        extraCharges: extraChargesInput.value
    };
    localStorage.setItem('invoiceFormData', JSON.stringify(formData));
}

function loadFormData() {
    const savedData = localStorage.getItem('invoiceFormData');
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            
            if (confirm('Would you like to restore your previous form data?')) {
                flatNumberInput.value = formData.flatNumber || '';
                invoiceDateInput.value = formData.invoiceDate || '';
                fromMonthInput.value = formData.fromMonth || '';
                toMonthInput.value = formData.toMonth || '';
                maintenanceFeeInput.value = formData.maintenanceFee || '';
                lateFeeInput.value = formData.lateFee || '';
                extraChargesInput.value = formData.extraCharges || '';
                
                calculateTotal();
            } else {
                localStorage.removeItem('invoiceFormData');
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
}

// Auto-save on input change
const formInputs = [flatNumberInput, invoiceDateInput, fromMonthInput, toMonthInput,
                   maintenanceFeeInput, lateFeeInput, extraChargesInput];

formInputs.forEach(input => {
    input.addEventListener('change', saveFormData);
});

// Load saved data on page load
window.addEventListener('load', loadFormData);

// Clear saved data after successful invoice generation
invoiceForm.addEventListener('submit', function() {
    localStorage.removeItem('invoiceFormData');
});

console.log('Invoice Generator - Madhav Homes E-Block');
console.log('Version 1.0 - Fully Functional');
