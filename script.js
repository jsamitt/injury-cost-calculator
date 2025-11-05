// Injury Cost Calculator – OSHA Safety Pays + Rounded Dollars
document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('output');
  const injurySelect = document.getElementById('injury-type');
  const customField = document.getElementById('custom-cost-field');
  const customInput = document.getElementById('custom-cost');
  const profitInput = document.getElementById('profit-margin');

  // Update direct cost on injury select
  function updateDirectCost() {
    const selected = injurySelect.value;
    if (selected === 'custom') {
      customField.style.display = 'block';
      customInput.focus();
    } else {
      customField.style.display = 'none';
      const option = injurySelect.options[injurySelect.selectedIndex];
      const cost = option.getAttribute('data-cost');
      if (cost) {
        customInput.value = ''; // Reset custom
      }
    }
    calculateCosts();
  }

  // Event listeners
  injurySelect.addEventListener('change', updateDirectCost);
  [customInput, profitInput].forEach(el => {
    el.addEventListener('input', calculateCosts);
    el.addEventListener('change', calculateCosts);
  });

  function calculateCosts() {
    const injury = injurySelect.value;
    let directCosts = parseFloat(customInput.value) || 0;
    const profitMargin = parseFloat(profitInput.value) || 0;

    // Get direct cost from selection if not custom
    if (injury && injury !== 'custom' && directCosts === 0) {
      const option = injurySelect.options[injurySelect.selectedIndex];
      directCosts = parseFloat(option.getAttribute('data-cost')) || 0;
    }

    // Validation
    if (directCosts <= 0 || profitMargin <= 0) {
      output.innerHTML = '<p class="placeholder">Please enter valid direct costs and profit margin.</p>';
      return;
    }

    // OSHA Indirect Multiplier (sliding scale)
    let indirectMultiplier;
    if (directCosts < 3000) indirectMultiplier = 4.5;
    else if (directCosts < 5000) indirectMultiplier = 1.6;
    else if (directCosts < 10000) indirectMultiplier = 1.2;
    else indirectMultiplier = 1.1;

    const indirectCosts = directCosts * indirectMultiplier;
    const totalCosts = directCosts + indirectCosts;
    const salesToOffset = totalCosts / (profitMargin / 100);

    // ROUND TO NEAREST DOLLAR
    const round = num => Math.round(num);

        // Results HTML with enhanced tooltip
    let resultsHTML = `
      <h3>Estimated Costs Breakdown</h3>
      <div class="cost-breakdown">
        <div class="cost-item"><span>Direct Costs (Medical + Comp):</span><strong>$${round(directCosts).toLocaleString()}</strong></div>
                <div class="cost-item">
          <span>Indirect Costs (Lost Productivity, etc.)</span>
          <span class="tooltip-trigger">?</span>
          <div class="tooltip-content">
            <p style="margin:0 0 0.5rem 0; font-weight:600;">Types of indirect costs may include:</p>
            <ul>
              <li>Any wages paid to injured workers for absences not covered by workers&#39; compensation (e.g. sick leave, PTO, STD)</li>
              <li>Wage costs related to time lost through work stoppage associated with the worker injury</li>
              <li>Overtime costs necessitated by the injury</li>
              <li>Administrative time spent by supervisors, safety personnel, and clerical workers after an injury</li>
              <li>Training costs for a replacement worker</li>
              <li>Lost productivity related to work rescheduling, new employee learning curves, and accommodation of injured employees</li>
              <li>Clean-up, repair, and replacement costs of damaged material, machinery, and property</li>
            </ul>
          </div>
          <strong>$${round(indirectCosts).toLocaleString()}</strong>
        </div>
        <hr style="margin:1rem 0;">
        <div class="cost-item" style="font-size:1.1rem;"><span>Total Estimated Cost:</span><strong style="color:#d32f2f;">$${round(totalCosts).toLocaleString()}</strong></div>
        <div class="cost-item" style="font-size:1.1rem;"><span>Sales Needed to Offset (at ${profitMargin}% margin):</span><strong style="color:#d32f2f;">$${round(salesToOffset).toLocaleString()}</strong></div>
      </div>
      <p class="note" style="margin-top:1rem; font-size:0.9rem; color:#555;">
        This does not include additional possible costs from:
        <ul style="margin:0.5rem 0 0.5rem 1.5rem; padding:0; color:#555; font-size:0.9rem;">
          <li>OSHA fines and any associated legal action</li>
          <li>Third-party liability and legal costs</li>
          <li>Worker pain and suffering</li>
          <li>Loss of good will from bad publicity</li>
        </ul>
        <hr style="margin:0.75rem 0; border-color:#ddd;">
        <em>Indirect costs include training, overtime, and lost productivity. Source: OSHA Safety Pays (NCCI data, 2022-2023). All figures rounded to nearest dollar.</em>
      </p>
    `;
    output.innerHTML = resultsHTML;
  }

  // Initial calc
  updateDirectCost();
  // Mobile: Toggle tooltip on tap
  document.querySelectorAll('.tooltip-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const content = trigger.nextElementSibling;
      const isVisible = content.style.display === 'block';
      // Hide all others
      document.querySelectorAll('.tooltip-content').forEach(c => c.style.display = 'none');
      // Toggle this one
      content.style.display = isVisible ? 'none' : 'block';
    });
  });

  // Hide on click outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.tooltip-content').forEach(c => c.style.display = 'none');
});
