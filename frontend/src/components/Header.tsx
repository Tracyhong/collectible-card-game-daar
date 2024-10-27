import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Header: React.FC = () => {
  return (
    <Navbar bg="dark" data-bs-theme="dark" fixed="top" style={{ padding: '10px 0' }}>
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ fontSize: '1.5rem' }}>TCG</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/" style={{ fontSize: '1.2rem', margin: '0 15px' }}>Home</Nav.Link>
          <Nav.Link as={Link} to="/sets" style={{ fontSize: '1.2rem', margin: '0 15px' }}>Sets</Nav.Link>
          <Nav.Link as={Link} to="/users" style={{ fontSize: '1.2rem', margin: '0 15px' }}>Users</Nav.Link>
          <Nav.Link as={Link} to="/booster" style={{ fontSize: '1.2rem', margin: '0 15px' }}>Boosters</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
