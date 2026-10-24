(() => {
  const modal = document.getElementById('audit-modal');
  const form = document.getElementById('audit-form');
  if (!modal || !form) return;
  const closeButton = modal.querySelector('.audit-modal__close');
  const status = document.getElementById('audit-status');
  const submit = document.getElementById('audit-submit');
  let opener = null;
  const close = () => { modal.hidden = true; document.body.classList.remove('audit-modal-open'); if (opener) opener.focus(); };
  document.querySelectorAll('[data-open-audit]').forEach(button => button.addEventListener('click', () => { opener = button; modal.hidden = false; document.body.classList.add('audit-modal-open'); closeButton.focus(); }));
  modal.querySelectorAll('[data-close-audit]').forEach(button => button.addEventListener('click', close));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) close(); });
  form.addEventListener('submit', async event => {
    event.preventDefault(); status.classList.remove('is-error'); if (!form.reportValidity()) return;
    submit.disabled = true; submit.textContent = 'Sending...'; status.textContent = 'Sending your enquiry...';
    const values = Object.fromEntries(new FormData(form).entries());
    const templateParams = {
      from_name: values.Name,
      designation: values.Designation,
      company_name: values['Company Name'],
      industry_type: values['Industry Type'],
      location: values.Location,
      contact_number: values['Contact Number'],
      reply_to: values['Email Address'],
      endpoints: values['Number of Endpoints/Systems'],
      enquiry_details: values['Enquiry Details']
    };
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: 'service_qqnfi2a', template_id: 'template_ue21te8', user_id: 'Dg21_S-t9ll7D8AGO', template_params: templateParams })
      });
      if (!response.ok) throw new Error('The enquiry could not be sent. Please try again.');
      form.reset(); status.textContent = 'Your enquiry was sent successfully. We will be in touch soon.';
    } catch (error) { status.textContent = error.message || 'We could not send your enquiry. Please try again or email info@itcraft.net.in.'; status.classList.add('is-error'); }
    finally { submit.disabled = false; submit.innerHTML = 'Submit enquiry <span aria-hidden="true">&#8599;</span>'; }
  });
})();
