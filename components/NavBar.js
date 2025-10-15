/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import Link from 'next/link';
import {
  Navbar, //
  Container,
  Nav,
  Button,
} from 'react-bootstrap';
import { signOut } from '../utils/auth';

export default function NavBar() {
  return (
    <>
      <Navbar className="navbar-navbar" collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Container>
          <Link passHref href="/">
            <Navbar.Brand>
              <img
                style={{ width: '60px', height: '60px' }}
                src="https://i.imgur.com/6uLZ8vB.png"
                alt="LaughLounge"
                height="40px"
              />
            </Navbar.Brand>
          </Link>

          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav style={{
              width: '100%',
              display: 'flex',
            justifyContent: 'space-between',
          }}
            >
              <div style={{
                display: 'flex',
              }}
              >
                <Link passHref href="/">
                  <Nav.Link className="clickableLink" style={{ marginRight: '15px' }}>Home </Nav.Link>
                </Link>
                <Link passHref href="/joke/edit/new">
                  <Nav.Link className="clickableLink" style={{ marginRight: '15px' }}>Add Jokes</Nav.Link>
                </Link>
                <Link passHref href="/joke/joke-generator">
                  <Nav.Link className="clickableLink" style={{ marginRight: '15px' }}>Generate jokes</Nav.Link>
                </Link>
                <Link passHref href="/profile/profile">
                  <Nav.Link className="clickableLink" style={{ marginRight: '15px' }}>Profile</Nav.Link>
                </Link>
              </div>
              <div style={{
                display: 'flex',
                marginLeft: 'auto',
              }}
              >
                <Button variant="danger" onClick={signOut}>Sign Out</Button>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}
