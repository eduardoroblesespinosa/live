document.addEventListener('DOMContentLoaded', () => {
    const eventsContainer = document.getElementById('events-container');
    const modal = document.getElementById('ticket-modal');
    const closeModalButton = document.querySelector('.close-button');
    const totalPriceEl = modal.querySelector('#total-price-modal');
    const paypalButtonContainer = document.getElementById('paypal-button-container');

    // Confirmation modal elements
    const confirmationModal = document.getElementById('confirmation-modal');
    const closeConfirmationButton = confirmationModal.querySelector('.conf-close-button');
    const printTicketBtn = document.getElementById('print-ticket-btn');

    let currentEvent = null;
    let paypalButtons = null;

    const concerts = [
        {
            artist: "Stellar Echoes",
            date: "15 de Mayo, 2026",
            time: "20:00",
            venue: "Arena Ciudad de México",
            prices: { general: 65.00, vip: 150.00 },
            image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800'
        },
        {
            artist: "Crimson Cascade",
            date: "22 de Junio, 2026",
            time: "21:00",
            venue: "Arena Ciudad de México",
            prices: { general: 55.00, vip: 130.00 },
            image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'
        },
        {
            artist: "Neon Phantoms",
            date: "18 de Julio, 2026",
            time: "20:30",
            venue: "Arena Ciudad de México",
            prices: { general: 70.00, vip: 165.00 },
            image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800'
        },
        {
            artist: "Solar Bloom",
            date: "05 de Agosto, 2026",
            time: "19:00",
            venue: "Arena Ciudad de México",
            prices: { general: 50.00, vip: 120.00 },
            image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
        },
        {
            artist: "Lunar Tides",
            date: "10 de Septiembre, 2026",
            time: "21:00",
            venue: "Arena Ciudad de México",
            prices: { general: 75.00, vip: 180.00 },
            image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800'
        }
    ];

    function renderEvents() {
        eventsContainer.innerHTML = '';
        concerts.forEach((event, index) => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card-ticket';
            eventCard.innerHTML = `
                <div class="event-main" style="background-image: linear-gradient(to right, rgba(18, 18, 18, 0.95) 40%, rgba(18, 18, 18, 0.4)), url('${event.image}');">
                    <div class="event-details">
                        <h3 class="event-artist">${event.artist}</h3>
                        <p class="tour-name">Gira 2026</p>
                        <div class="event-meta">
                            <p class="event-date"><span>Fecha:</span> ${event.date}</p>
                            <p class="event-time"><span>Hora:</span> ${event.time}</p>
                            <p class="event-venue"><span>Lugar:</span> ${event.venue}</p>
                        </div>
                    </div>
                </div>
                <div class="event-stub">
                    <div class="stub-logo">
                        <img src="logo.png" alt="Live! Logo">
                    </div>
                    <button class="buy-tickets-btn" data-event-index="${index}">Comprar Boletos</button>
                    <div class="stub-barcode"></div>
                </div>
            `;
            eventsContainer.appendChild(eventCard);
        });
    }
    
    function openModal(eventIndex) {
        currentEvent = concerts[eventIndex];
        
        document.getElementById('modal-artist-name').textContent = currentEvent.artist;
        document.getElementById('modal-event-details').textContent = `${currentEvent.date} - ${currentEvent.time} | ${currentEvent.venue}`;
        
        const generalPriceEl = document.getElementById('modal-general-price');
        const vipPriceEl = document.getElementById('modal-vip-price');
        generalPriceEl.textContent = `$${currentEvent.prices.general.toFixed(2)}`;
        vipPriceEl.textContent = `$${currentEvent.prices.vip.toFixed(2)}`;
        
        const quantityInputs = modal.querySelectorAll('.quantity-input');
        quantityInputs.forEach(input => input.value = 0);
        
        updateTotalPrice();
        
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('visible'), 10);
    }
    
    function closeModal() {
        modal.classList.remove('visible');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    function closeConfirmationModal() {
        confirmationModal.classList.remove('visible');
        setTimeout(() => confirmationModal.style.display = 'none', 300);
    }

    function showConfirmationTicket(details) {
        const transactionId = details.id;
        const items = details.purchase_units[0].items;

        document.getElementById('ticket-artist-name').textContent = currentEvent.artist;
        document.getElementById('stub-artist').textContent = currentEvent.artist;
        document.getElementById('ticket-event-date').textContent = `${currentEvent.date} - ${currentEvent.time}`;
        document.getElementById('ticket-event-venue').textContent = currentEvent.venue;

        let ticketInfoText = '';
        let qrData = `Transacción: ${transactionId}\nArtista: ${currentEvent.artist}\n`;
        let ticketTypeSummary = '';

        items.forEach(item => {
            const qty = item.quantity;
            const type = item.name.includes('General') ? 'General' : 'VIP';
            ticketInfoText += `<p>${qty} x Boleto ${type}</p>`;
            qrData += `Boleto ${type}: ${qty}\n`;
            if (ticketTypeSummary) ticketTypeSummary += ' / ';
            ticketTypeSummary += `${qty}x ${type}`;
        });
        
        document.getElementById('ticket-type-info').innerHTML = ticketInfoText;
        document.getElementById('stub-ticket-type').textContent = ticketTypeSummary;

        // Generate QR Code
        const qrCodeContainer = document.getElementById('qrcode');
        qrCodeContainer.innerHTML = '';
        try {
            const qr = qrcode(0, 'L');
            qr.addData(qrData);
            qr.make();
            qrCodeContainer.innerHTML = qr.createImgTag(4, 4);
        } catch (e) {
            console.error("Error generating QR code:", e);
            qrCodeContainer.textContent = 'Error al generar QR.';
        }

        confirmationModal.style.display = 'block';
        setTimeout(() => confirmationModal.classList.add('visible'), 10);
    }

    function updateTotalPrice() {
        if (!currentEvent) return;
        
        let total = 0;
        const quantityInputs = modal.querySelectorAll('.quantity-input');
        
        quantityInputs.forEach(input => {
            const ticketType = input.dataset.ticketType;
            const price = currentEvent.prices[ticketType];
            const quantity = parseInt(input.value) || 0;
            total += price * quantity;
        });
        
        totalPriceEl.textContent = total.toFixed(2);
        
        renderPayPalButton(total);
    }

    function renderPayPalButton(total) {
        paypalButtonContainer.innerHTML = '';
        if (total > 0 && typeof paypal !== 'undefined') {
             paypalButtons = paypal.Buttons({
                createOrder: function(data, actions) {
                    const quantityInputs = modal.querySelectorAll('.quantity-input');
                    const generalQty = parseInt(quantityInputs[0].value) || 0;
                    const vipQty = parseInt(quantityInputs[1].value) || 0;

                    const items = [];
                    if (generalQty > 0) {
                        items.push({
                            name: `Boleto General - ${currentEvent.artist}`,
                            unit_amount: { value: currentEvent.prices.general.toFixed(2), currency_code: 'USD' },
                            quantity: generalQty.toString()
                        });
                    }
                    if (vipQty > 0) {
                         items.push({
                            name: `Boleto VIP - ${currentEvent.artist}`,
                            unit_amount: { value: currentEvent.prices.vip.toFixed(2), currency_code: 'USD' },
                            quantity: vipQty.toString()
                        });
                    }

                    return actions.order.create({
                        purchase_units: [{
                            description: `Boletos para ${currentEvent.artist}`,
                            amount: {
                                value: total.toFixed(2),
                                currency_code: 'USD',
                                breakdown: {
                                    item_total: {
                                        value: total.toFixed(2),
                                        currency_code: 'USD'
                                    }
                                }
                            },
                            items: items
                        }]
                    });
                },
                onApprove: function(data, actions) {
                    return actions.order.capture().then(function(details) {
                        showConfirmationTicket(details);
                        closeModal();
                    });
                },
                onError: function(err) {
                    console.error('Ocurrió un error en el proceso de pago de PayPal:', err);
                    alert('Ocurrió un error con el pago. Por favor, inténtalo de nuevo.');
                },
                style: {
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'pay'
                }
            });
            if (paypalButtons.isEligible()) {
                 paypalButtons.render('#paypal-button-container');
            } else {
                paypalButtonContainer.innerHTML = "PayPal no está disponible.";
            }
        }
    }
    
    // Event Listeners
    eventsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('buy-tickets-btn')) {
            const eventIndex = e.target.dataset.eventIndex;
            openModal(eventIndex);
        }
    });

    closeModalButton.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    closeConfirmationButton.addEventListener('click', closeConfirmationModal);
    
    printTicketBtn.addEventListener('click', () => {
        const ticketContent = document.querySelector('.ticket-design');
        if (ticketContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            printWindow.document.write('<html><head><title>Tu Boleto</title>');
            printWindow.document.write('<link rel="stylesheet" href="style.css">');
            printWindow.document.write('<style>body { background: #fff; } .ticket-design { margin: 20px; box-shadow: none; border: 1px solid #ccc; } .ticket-actions { display: none; } </style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(ticketContent.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            
            setTimeout(() => { // Wait for content to load
                printWindow.print();
                printWindow.close();
            }, 500);
        }
    });
    
    modal.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('quantity-btn')) {
            const input = target.classList.contains('plus')
                ? target.previousElementSibling
                : target.nextElementSibling;
            let value = parseInt(input.value);

            if (target.classList.contains('plus')) {
                value++;
            } else if (value > 0) {
                value--;
            }
            input.value = value;
            updateTotalPrice();
        }
    });
    
    modal.addEventListener('change', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            if (parseInt(e.target.value) < 0 || e.target.value === '') {
                e.target.value = 0;
            }
            updateTotalPrice();
        }
    });

    modal.querySelector('#buy-btn').addEventListener('click', () => {
        const total = parseFloat(modal.querySelector('#total-price').textContent);
        if (total > 0) {
            alert(`¡Gracias por tu compra para ${currentEvent.artist}! Total: $${total.toFixed(2)}`);
            closeModal();
        } else {
            alert('Por favor, selecciona al menos un boleto.');
        }
    });

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            const subject = `Mensaje de ${name} (${email}) desde el sitio web`;
            
            // The user provided email had a space, which is invalid. It has been removed.
            const recipientEmail = 'eduardoroblesespinosa@hotmail.com';
            
            const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
            
            window.location.href = mailtoLink;

            // Optionally, reset the form after submission attempt
            contactForm.reset();
        });
    }

    renderEvents();
});