const { clipboard, shell } = require('electron');
const { messages, channels } = require('ac/webpack');
const SpotifyPlayer = require('../SpotifyPlayer');

module.exports = (state, onButtonClick) => [
  [ {
    type: 'submenu',
    name: 'Devices',
    width: '205px',
    getItems: () => SpotifyPlayer.getDevices()
      .then(({ devices }) =>
        devices.map(device => {
          const isActiveDevice = device.id === state.deviceID;

          return {
            type: 'button',
            name: device.name,
            hint: device.type,
            highlight: isActiveDevice && '#1ed860',
            disabled: isActiveDevice,
            seperate: isActiveDevice,
            onClick: () => onButtonClick('setActiveDevice', device.id)
          };
        })
        .sort(button => !button.highlight)
      )
  } ],

  [ {
    type: 'submenu',
    name: 'Playlists',
    getItems: () => SpotifyPlayer.getPlaylists()
      .then(({ items }) =>
        items.map(playlist => ({
          type: 'button',
          name: playlist.name,
          hint: `${playlist.tracks.total} tracks`,
          onClick: () => onButtonClick('play', {
            context_uri: playlist.uri
          })
        }))
      )
  } ],

  [ {
    type: 'submenu',
    name: 'Playback Settings',
    getItems: () => [ {
      type: 'submenu',
      name: 'Repeat Modes',
      getItems: () => [ {
        name: 'Repeat Current Playlist/Album',
        stateName: 'context'
      }, {
        name: 'Repeat Current Track',
        stateName: 'track'
      }, {
        name: 'Repeat Off',
        stateName: 'off'
      } ].map(button => ({
        type: 'button',
        highlight: state.repeatState === button.stateName && '#1ed860',
        disabled: state.repeatState === button.stateName,
        onClick: () => onButtonClick('setRepeatState', button.stateName),
        ...button
      }))
    }, {
      type: 'checkbox',
      name: 'Shuffle',
      defaultState: state.shuffleState,
      onToggle: (state) => onButtonClick('setShuffleState', state)
    } ]
  } ],

  [ {
    type: 'slider',
    name: 'Volume',
    color: '#1ed860',
    defaultValue: state.volume,
    onValueChange: (val) =>
      SpotifyPlayer.setVolume(Math.round(val))
        .then(() => true)
  } ],

  [ {
    type: 'button',
    name: 'Open in Spotify',
    onClick: () =>
      shell.openExternal(state.currentItem.uri)
  }, {
    type: 'button',
    name: 'Send URL to Channel',
    onClick: () =>
      messages.sendMessage(
        channels.getChannelId(),
        { content: state.currentItem.url }
      )
  }, {
    type: 'button',
    name: 'Copy URL',
    onClick: () =>
      clipboard.writeText(state.currentItem.url)
  } ]
];