let messageStack = []; // Array to keep track of current messages

export function showMessage(messageText, type = "success") {
  // Create the floating message element
  const message = document.createElement('div');
  message.textContent = messageText;
  message.innerHTML = messageText.replace(/\n/g, '<br>');

  // Set styles based on message type
  message.style.position = 'fixed';
  message.style.right = '20px'; // Right position for top-right corner
  message.style.padding = '15px 20px';
  message.style.borderRadius = '8px';
  message.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  message.style.fontFamily = 'Arial, sans-serif';
  message.style.fontSize = '16px';
  message.style.zIndex = '1000';
  message.style.opacity = '0';
  message.style.transform = 'translateY(-20px)';
  message.style.transition = 'opacity 0.4s, transform 0.4s';

  // Color and background based on type
  if (type === "success") {
    message.style.backgroundColor = '#4caf50'; // Green for success
    message.style.color = 'white';
  } else if (type === "error") {
    message.style.backgroundColor = '#f44336'; // Red for error
    message.style.color = 'white';
  }

  // Calculate vertical position based on stack
  const offset = 20 + messageStack.length * 70; // 20px margin + 70px height per message
  message.style.top = `${offset}px`;

  // Append the message to the body
  document.body.appendChild(message);

  // Add the message to the stack
  messageStack.push(message);

  // Show the message
  setTimeout(() => {
    message.style.opacity = '1';
    message.style.transform = 'translateY(0)';
  }, 10);

  // Automatically hide the message after 3 seconds
  setTimeout(() => {
    message.style.opacity = '0';
    message.style.transform = 'translateY(-20px)';
    // Remove the message from the DOM after transition
    setTimeout(() => {
      message.remove();
      // Remove the message from the stack and adjust positions
      messageStack = messageStack.filter((msg) => msg !== message);
      updateMessagePositions();
    }, 400);
  }, 3000);
}

// Update the positions of the messages in the stack
function updateMessagePositions() {
  messageStack.forEach((msg, index) => {
    const offset = 20 + index * 70; // 20px margin + 70px height per message
    msg.style.top = `${offset}px`;
  });
}
