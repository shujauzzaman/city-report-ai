function loadNavbar() {
    const notifications = [
        {
            id: 1,
            text: "Your complaint <strong>#SC-1024</strong> assigned.",
            time: "2 mins ago",
            icon: "bi-clipboard-check",
            type: "success",
            unread: true
        },
        {
            id: 2,
            text: "Street light issue resolved.",
            time: "45 mins ago",
            icon: "bi-check-circle",
            type: "info",
            unread: true
        }
    ];

    // Generate the list items with beautiful styling
    const notificationHTML = notifications.map(n => `
        <li>
            <a class="dropdown-item notification-item" href="#">
                <!-- Soft background icon circle -->
                <div class="icon-circle bg-${n.type} bg-opacity-10 text-${n.type} me-3">
                    <i class="bi ${n.icon}"></i>
                </div>
                <div class="flex-grow-1">
                    <p class="mb-0 small text-dark">${n.text}</p>
                    <div class="d-flex justify-content-between align-items-center mt-1">
                        <small class="text-muted">${n.time}</small>
                        ${n.unread ? '<span class="unread-dot"></span>' : ''}
                    </div>
                </div>
            </a>
        </li>
    `).join("");

    document.getElementById("navbar-placeholder").innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-0 breadcrumb-custom">
                    <li class="breadcrumb-item">Portal</li>
                    <li class="breadcrumb-item active">Dashboard</li>
                </ol>
            </nav>

            <div class="dropdown">
                <button class="btn btn-light position-relative dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-bell"></i>
                    <span class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
                </button>

                <ul class="dropdown-menu dropdown-menu-end shadow notification-dropdown mt-2">

                    ${notificationHTML}

                    <!-- Footer Section -->
                    <li class="p-2 text-center border-top">
                        <a href="notifications.html" class="text-success fw-bold small text-decoration-none d-block py-1">
                            View all notifications
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    `;
}