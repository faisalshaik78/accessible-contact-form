# Accessible Contact Form

A responsive contact form built with **HTML, CSS, and vanilla JavaScript**. The project demonstrates accessible form structure, client-side validation, clear feedback, and a confirmation state.

## Preview

Open the project locally in a browser to try the form.

## Features

- Semantic form structure with labels, fieldsets, and legends
- Required and optional fields, radio buttons, checkboxes, and a subject dropdown
- Live validation with clear, field-specific error messages
- Indian mobile-number validation (10 digits, starting with 6–9)
- Keyboard-visible focus styles and screen-reader announcements
- Character counter for the message field
- Submission summary built safely with DOM text nodes
- Responsive layout for desktop, tablet, and mobile
- Respects the user's reduced-motion preference

## Tech stack

- HTML5
- CSS3
- JavaScript (ES6+)

## Run locally

1. Clone the repository:
   `git clone https://github.com/faisalshaik78/accessible-contact-form.git`
2. Open the project folder.
3. Open `index.html` in your browser.

No package installation, build step, or external JavaScript library is required.

## Project structure

```text
accessible-contact-form/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Validation and accessibility

The form provides labels for controls, groups related choices with fieldsets, displays errors beside the relevant fields, and moves focus to the first invalid control after an unsuccessful submission. The layout also includes visible keyboard focus and reduced-motion support.

## Demo limitation

This is a **front-end demo only**. It does not send or store form submissions on a server. The confirmation screen displays the entered details in the current browser session.

## Future improvements

- Connect the form to a secure backend or form service
- Add automated accessibility and validation tests
- Add a hosted live demo

---

Built as a practical front-end project to practise accessible HTML, responsive CSS, and JavaScript form handling.
