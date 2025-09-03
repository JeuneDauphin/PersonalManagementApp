
import React from 'react';
import { Contact } from '../../../utils/interfaces/interfaces';

interface ContactCardProps {
    contact: Contact;
    onClick: (contact: Contact) => void;
    isSelected?: boolean;
}
// A card component to display brief contact information
const ContactCard: React.FC<ContactCardProps> = ({ contact, onClick, isSelected }) => {
    return (
        <div
            className={`rounded-lg shadow-md p-4 cursor-pointer transition border ${isSelected ? 'border-blue-500' : 'border-gray-200'} hover:shadow-lg relative bg-white`}
            onClick={() => onClick(contact)}
        >
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">{contact.type}</span>
                <div className="flex gap-2 opacity-0 hover:opacity-100 transition-opacity absolute right-4 top-4">
                    <button className="text-blue-500 hover:text-blue-700">Edit</button>
                    <button className="text-red-500 hover:text-red-700">Delete</button>
                </div>
            </div>
            <div className="font-bold text-lg">{contact.firstName} {contact.lastName}</div>
            {contact.email && <div className="text-sm text-gray-600">Email: {contact.email}</div>}
            {contact.phone && <div className="text-sm text-gray-600">Phone: {contact.phone}</div>}
            {contact.type === 'work' && contact.company && <div className="text-sm text-gray-600">Company: {contact.company}</div>}
            {contact.type === 'work' && contact.position && <div className="text-sm text-gray-600">Job Title: {contact.position}</div>}
            {contact.type === 'school' && contact.company && <div className="text-sm text-gray-600">School: {contact.company}</div>}
            {contact.type === 'school' && contact.position && <div className="text-sm text-gray-600">Subject: {contact.position}</div>}
            {contact.type === 'personal' && contact.notes && <div className="text-sm text-gray-600">Notes: {contact.notes}</div>}
        </div>
    );
};

export default ContactCard;