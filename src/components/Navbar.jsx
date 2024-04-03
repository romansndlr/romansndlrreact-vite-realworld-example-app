import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks'
import Button from '@mui/material/Button'
import { useDispatch } from 'react-redux'
import { openDrawer } from '../state/drawer/drawerSlice'

function Navbar() {
  const { isAuth, authUser } = useAuth()
  const dispatch = useDispatch()
  const location = useLocation();

  const showDrawer = () => {
    dispatch(openDrawer())
  }

  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <NavLink activeClassName="active" className="navbar-brand" to="/" end>
          conduit
        </NavLink>
        <ul className="nav navbar-nav pull-xs-right">
          <li className="nav-item">
            <NavLink activeClassName="active" className="nav-link" to="/" end>
              Home
            </NavLink>
          </li>
          {isAuth && (
            <>
              <li className="nav-item">
                <NavLink activeClassName="active" className="nav-link" to="/editor">
                  <i className="ion-compose" />
                  &nbsp;New Post
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink activeClassName="active" className="nav-link" to="/settings">
                  <i className="ion-gear-a" />
                  &nbsp;Settings
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to={`/@${authUser?.username}`}>
                  <img style={{ width: 24, height: 24, marginRight: 4, borderRadius: '50%' }} src={authUser?.image} />
                  {authUser?.username}
                </NavLink>
              </li>
            </>
          )}
          {!isAuth && (
            <>
              <li className="nav-item">
                <NavLink activeClassName="active" className="nav-link" to="/register">
                  Sign up
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink activeClassName="active" className="nav-link" to="/login">
                  Sign in
                </NavLink>
              </li>
            </>
          )}
          {location.pathname === '/' && (
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#5CB85B',
                marginLeft: 3,
                '&:hover': {
                  backgroundColor: '#76ba75',
                },
              }}
              onClick={showDrawer}
            >
              Latest Article
            </Button>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
