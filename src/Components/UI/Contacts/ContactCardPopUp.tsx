
import React from 'react';
import { Contact } from '../../../utils/interfaces/interfaces';

interface ContactCardPopUpProps {
    contact: Contact;
    isOpen: boolean;
    onClose: () => void;
}

const ContactCardPopUp: React.FC<ContactCardPopUpProps> = ({ contact, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blurry Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-10 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative z-10" onClick={e => e.stopPropagation()}>
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>×</button>
                <div className="mb-2 text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">{contact.type}</div>
                <div className="font-bold text-xl mb-2">{contact.firstName} {contact.lastName}</div>
                {contact.email && <div className="text-sm text-gray-600">Email: {contact.email}</div>}
                {contact.phone && <div className="text-sm text-gray-600">Phone: {contact.phone}</div>}
                {contact.company && <div className="text-sm text-gray-600">Company/School: {contact.company}</div>}
                {contact.position && <div className="text-sm text-gray-600">Job Title/Subject: {contact.position}</div>}
                {contact.notes && <div className="text-sm text-gray-600">Notes: {contact.notes}</div>}
                {contact.socialLinks && (
                    <div className="mt-2">
                        <div className="font-semibold text-sm">Social Media:</div>
                        <ul className="list-disc ml-4">
                            {contact.socialLinks.linkedin && <li>LinkedIn: <a href={contact.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{contact.socialLinks.linkedin}</a></li>}
                            {contact.socialLinks.twitter && <li>Twitter: <a href={contact.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{contact.socialLinks.twitter}</a></li>}
                            {contact.socialLinks.github && <li>GitHub: <a href={contact.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 underline">{contact.socialLinks.github}</a></li>}
                        </ul>
                    </div>
                )}
                <div className="flex gap-2 mt-4">
                    <button className="text-blue-500 hover:text-blue-700">Edit</button>
                    <button className="text-red-500 hover:text-red-700">Delete</button>
                </div>
            </div>
        </div>
    );
};

export default ContactCardPopUp;
