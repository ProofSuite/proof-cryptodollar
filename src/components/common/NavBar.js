import React, { Component } from 'react'
import { Menu, Segment } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

class NavBar extends Component {
  state = { activeItem: 'home' }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render () {
    const { activeItem } = this.state

    return (
      <Segment inverted>
        <Menu secondary borderless inverted>
          <Link to='/'>
            <Menu.Item name='Cryptofiat' active={activeItem === 'Cryptofiat'} onClick={this.handleItemClick} />
          </Link>
          <Link to='/dex'>
            <Menu.Item name='DEX' active={activeItem === 'DEX'} onClick={this.handleItemClick} />
          </Link>
        </Menu>
      </Segment>
    )
  }
}

export default NavBar
