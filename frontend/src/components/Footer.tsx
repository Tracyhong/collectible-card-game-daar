import React from 'react';

const Footer = () => {
    return (
        <footer
            className="bg-light text-center py-2 fixed-bottom"
            style={{
                borderTop: '1px solid #dee2e6',
                zIndex: 1030,
            }}
        >
            <div className="container">
                <p className="mb-0" style={{ fontSize: '0.80rem', color: '#343a40', lineHeight: '1.2' }}>
                    &copy; 2024 TCG Pokemon Blockchain
                </p>
                <p className="mb-0" style={{ fontSize: '0.80rem', color: '#343a40', lineHeight: '1.2' }}>
                    &copy; Tracy HONG & Laura RATTANAVAN
                </p>
            </div>
        </footer>
    );
};

export default Footer;
