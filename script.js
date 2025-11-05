// Injury Cost Calculator – OSHA Safety Pays Methodology
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

    // Results HTML
    let resultsHTML = `
      <h3>Estimated Costs Breakdown</h3>
      <div class="cost-breakdown">
        <div class="cost-item"><span>Direct Costs (Medical + Comp):</span><strong>$${directCosts.toLocaleString()}</strong></div>
        <div class="cost-item"><span>Indirect Multiplier:</span><strong>${indirectMultiplier}x</strong></div>
        <div class="cost-item"><span>Indirect Costs (Lost Productivity, etc.):</span><strong>$${indirectCosts.toLocaleString()}</strong></div>
        <hr style="margin:1rem 0;">
        <div class="cost-item" style="font-size:1.1rem;"><span>Total Estimated Cost:</span><strong style="color:#d32f2f;">$${totalCosts.toLocaleString()}</strong></div>
        <div class="cost-item" style="font-size:1.1rem;"><span>Sales Needed to Offset (at ${profitMargin}% margin):</span><strong style="color:#d32f2f;">$${salesToOffset.toLocaleString()}</strong></div>
      </div>
      <p class="note" style="margin-top:1rem; font-size:0.9rem; color:#555;">
        <em>Indirect costs include training, overtime, and lost productivity. Source: OSHA Safety Pays (NCCI data, 2022-2023).</em>
      </p>
    `;

    output.innerHTML = resultsHTML;
  }

  // Initial calc
  updateDirectCost();
});
