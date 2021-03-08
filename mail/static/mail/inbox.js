document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-btn').addEventListener('click', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function reply_email(email) {

  // Show compose view and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Fill out composition fields
  document.querySelector('#compose-recipients').value = email.sender;
  if (email.subject.slice(0,3).toLowerCase() != 're:'){
    email.subject = `Re: ${email.subject}`;
  }
  document.querySelector('#compose-subject').value = email.subject;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: \n ${email.body}`;
}

function send_email() {

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });

};

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {    
    
    const ul = document.createElement('ul');
    ul.classList.add('mailbox-ul');

    emails.forEach(email => {
      
      const li = document.createElement('li');
      li.classList.add('mailbox-li');

      if (!email.read){
        li.classList.add('mailbox-unread');
      }

      const div_text = document.createElement('div');
      div_text.classList.add('div-text');

      const div_button = document.createElement('div');
      div_button.classList.add('div-button');
      
      if (!email.read){
        div_text.classList.add('mailbox-unread');
      }

      const subject = document.createElement('span');
      subject.classList.add(`mailbox-subject`);
      subject.append(email.subject);
      div_text.append(subject);

      if (mailbox === 'sent'){
        const recipients = document.createElement('span');
        recipients.classList.add(`mailbox-recipients`);
        recipients.append(`To: `);
        email.recipients.forEach(recipient => {
          recipients.append(`${recipient}, `);
        })
        div_text.append(recipients);
      } else {
        const sender = document.createElement('span');
        sender.classList.add(`mailbox-sender`);
        sender.append(`From: ${email.sender}`);
        div_text.append(sender);

        const read = document.createElement('button');
        read.classList.add('btn');
        read.classList.add('btn-sm');
        read.classList.add('btn-primary');
        if (email.read){
          read.value="Unmark as read";
          read.append(read.value);
        } else{
          read.value="Mark as read";
          read.append(read.value);
        };
        read.addEventListener('click', () => toogle_read(email));    
        div_button.append(read);

        const archived = document.createElement('button');
        archived.classList.add('btn');
        archived.classList.add('btn-sm');
        archived.classList.add('btn-primary');
        if (email.archived){
          archived.value="Unmark as archived";
          archived.append(archived.value);
        } else{
          archived.value="Mark as archived";
          archived.append(archived.value);
        };
        archived.addEventListener('click', () => toogle_archived(email));    
        div_button.append(archived);
      }

      const timestamp = document.createElement('span');
      timestamp.classList.add(`mailbox-timestamp`);
      timestamp.append(email.timestamp);
      div_text.append(timestamp);

      div_text.addEventListener('click', () => load_mail(email.id, mailbox));
      li.append(div_text);

      li.append(div_button);
            
      ul.append(li);

    });
    
    view = document.querySelector('#emails-view');    
    view.append(ul);

    console.log(emails);

    // ... do something else with emails ...
  });    
}

function toogle_archived(email) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !email.archived,
    })
  })
  .then(() => load_mailbox('inbox'))
}

function mark_read(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true,
    })
  })
}

function toogle_read(email) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: !email.read,
    })
  })
  .then(() => load_mailbox('inbox'))
}

function load_mail(id, mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  view = document.querySelector('#email-view');    
  view.style.display = 'block';
  view.innerHTML = '';

  mark_read(id);

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

    // Show the mail title
    const div_details = document.createElement('div');
    div_details.classList.add('div-details');

    const div_title = document.createElement('div');
    div_title.classList.add('div-title');

    const subject = document.createElement('h3');
    subject.classList.add(`email-subject`);
    subject.append(email.subject);
    div_title.append(subject);

    const sender = document.createElement('p');
    sender.classList.add(`email-sender`);
    sender.append(`From: ${email.sender}`);
    div_details.append(sender);

    const recipients = document.createElement('p');
    recipients.classList.add(`email-recipients`);
    recipients.append(`To: `);
    email.recipients.forEach(recipient => {
      recipients.append(`${recipient}, `);
    })
    div_details.append(recipients);

    const timestamp = document.createElement('p');
    timestamp.classList.add(`email-timestamp`);
    timestamp.append(email.timestamp);
    div_details.append(timestamp);

    if (mailbox != 'sent'){
      const archived = document.createElement('button');
      archived.classList.add('btn');
      archived.classList.add('btn-sm');
      archived.classList.add('btn-primary');
      if (email.archived){
        archived.value="Unmark as archived";
        archived.append(archived.value);
      } else{
        archived.value="Mark as archived";
        archived.append(archived.value);
      };

      archived.addEventListener('click', () => toogle_archived(email));    
      div_title.append(archived)

      const reply = document.createElement('button');
      reply.classList.add('btn');
      reply.classList.add('btn-sm');
      reply.classList.add('btn-primary');
      reply.value="Reply";
      reply.append(reply.value);
      reply.addEventListener('click', () => reply_email(email));    
      div_title.append(reply)
    }

    view.append(div_title);
    view.append(div_details);
    view.append( document.createElement('hr'));

    const body = document.createElement('p');
    body.classList.add(`email-body`);
    body.append(email.body);
    view.append(body);

  })
}