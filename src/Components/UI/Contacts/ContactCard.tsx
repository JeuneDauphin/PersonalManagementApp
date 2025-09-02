// this component is the card that displays a contact's basic information in the ContactList component
// each contact will be a card with a type(pro, school,...), name, email, phone number, and a link to the contact details
// it is a controlled component that receives the contact data and a function to open the ContactCardPopup.tsx component as props
// it is used in the ContactList component

//Interface; 
// - contact: the contact data to display
// - onClick: a function to open the ContactCardPopup.tsx component
// - isSelected: a boolean to highlight the card if it is selected
// information displayed:
// - contact type (pro, school, personal,...)
// - contact name
// - contact email
// - contact phone number
// - contact company (if pro)
// - contact job title (if pro)
// - contact school (if school)
// - contact major (if school)
// - contact personal notes (if personal)
// - edit button on hover
// - delete button on hover

// when Contactcard is clicked ; open as pop-up the ContactCardPopup.tsx component