
import React, { useState } from 'react';
import ContactCard from './ContactCard';
import ContactCardPopUp from './ContactCardPopUp';
import { useContacts } from '../../../utils/hooks/hooks';
import { Contact } from '../../../utils/interfaces/interfaces';

const ContactList: React.FC = () => {
    const { data: contacts, loading, error } = useContacts();
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);

    const handleContactClick = (contact: Contact) => {
        setSelectedContact(contact);
        setIsPopUpOpen(true);
    };

    const handleClosePopUp = () => {
        setIsPopUpOpen(false);
        setSelectedContact(null);
    };

    if (loading) return <div>Loading contacts...</div>;
    if (error) return <div>Error loading contacts: {error}</div>;
    if (!contacts || contacts.length === 0) return <div>No contacts found.</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {contacts.map(contact => (
                <ContactCard
                    key={contact._id}
                    contact={contact}
                    onClick={handleContactClick}
                    isSelected={selectedContact?._id === contact._id}
                />
            ))}
            {selectedContact && (
                <ContactCardPopUp
                    contact={selectedContact}
                    isOpen={isPopUpOpen}
                    onClose={handleClosePopUp}
                />
            )}
        </div>
    );
};

export default ContactList;

