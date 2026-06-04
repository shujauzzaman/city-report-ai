/**
 * Generates HTML for complaint cards
 * @param {Array} complaints - Array of complaint objects
 * @param {string} containerId - ID of the element to inject HTML into
 */
function renderComplaintCards(complaints, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = complaints.map(data => {
        // Priority logic
        const priorityBadge = data.priority === 'High' 
            ? `<span class="badge bg-danger position-absolute top-0 end-0 m-3 shadow-sm">High Priority</span>` 
            : '';

        // Status styling map
        const statusConfig = {
            'In Progress': 'bg-primary-subtle text-primary',
            'Submitted': 'bg-warning-subtle text-warning-emphasis',
            'Resolved': 'bg-success-subtle text-success'
        };

        const statusClass = statusConfig[data.status] || 'bg-secondary-subtle text-secondary';

        return `
            <div class="col-md-6 col-xl-4">
                <div class="app-card h-100 p-0 overflow-hidden border-0 shadow-sm clickable-card" 
                     onclick="window.location.href='view-complaint.html?id=${data.id}'"
                     style="cursor: pointer; transition: transform 0.2s ease;">
                    <div class="position-relative" style="height: 200px;">
                        <img src="${data.image}" class="w-100 h-100 object-fit-cover" alt="${data.title}">
                        ${priorityBadge}
                    </div>
                    <div class="p-4">
                        <div class="d-flex justify-content-between mb-2">
                            <small class="text-muted fw-bold">#SC-${data.id}</small>
                            <small class="text-muted">${data.date}</small>
                        </div>
                        <h5 class="fw-bold mb-2 text-dark">${data.title}</h5>
                        <p class="text-muted small mb-4 line-clamp-2">${data.description}</p>
                        <div class="d-flex align-items-center">
                            <span class="badge ${statusClass} rounded-pill px-3 py-2">
                                <i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i> ${data.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}