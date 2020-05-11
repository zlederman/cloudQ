


(function() {
    const loginButton = document.querySelector('.login');
    // const refreshButton = document.querySelector('.refresh');
    const getPlaylistsButton = document.querySelector('.get-playlists');
    
    const searchParams = new URLSearchParams(window.location.search)
    const access_token = searchParams.get('access_token');
    // const refresh_token = searchParams.get('refresh_token');
    const user_id = searchParams.get('user_id');
    
    function renderTracks(container, items) {
      const tracksFragment = document.createDocumentFragment();
      
      const tracks = items.map((item, index) => {
        const { track } = item;
        const { album, artists } = track;
        
        const trackElement = document.createElement('div');
        
        trackElement.classList.add('track');
        if(index === items.length - 1) trackElement.classList.add('last');
  
        trackElement.innerHTML = `
          <h3><a href="${track.external_urls.spotify}" target="_blank" rel="noopener noreferrer">${track.name}</a></h3>
          <h4>${album.name}</h4>
          <p>by ${artists.map(a => a.name).join(', ')}</p>
        `;
  
        return trackElement;
      });
      
      tracks.forEach(track => tracksFragment.appendChild(track));
      
      container.after(tracksFragment);
    }
    
    function renderPlaylists(container, items) {
      container.innerHTML = '';
      
      const playlistsFragment = document.createDocumentFragment();
      
      const playlists = items.map(item => {
        const playlistFragment = document.createDocumentFragment();
  
        const playlistTitle = document.createElement('h2');
        playlistTitle.innerHTML = `<a href="${item.external_urls.spotify}" target="_blank" rel="noopener noreferrer">${item.name}</a>`;
        
        playlistFragment.appendChild(playlistTitle);
        
        fetch(`/tracks?access_token=${access_token}&user_id=${user_id}&playlist_id=${item.id}`)
        .then(res => res.json())
        .then(({ items }) => {
          renderTracks(playlistTitle, items);
        });
  
        return playlistFragment;
      });
      
      playlists.forEach(playlist => playlistsFragment.appendChild(playlist));
      
      container.appendChild(playlistsFragment);
    }
    
    if(access_token) {
      loginButton.disabled = true;
      
      const actions = document.querySelector('.actions');
      const playlists = document.querySelector('.playlists');
      
      playlists.innerHTML = 'Loading...'
      
      
      
      fetch(`/playlists?access_token=${access_token}&user_id=${user_id}`)
      .then(res => res.json())
      .then(({playlists: {items}, user}) => {
        const heading = document.createElement('h1');
        heading.innerHTML = `<span>${user.display_name}</span>'s playlists`;
        actions.appendChild(heading);
      
        playlists.style.paddingTop = `${actions.scrollHeight}px`;
        
        renderPlaylists(
          playlists,
          items.filter(item => item.owner.id === user_id)
        )
      });
    }
    
    // if(refresh_token) {
    //   refreshButton.disabled = false;
    //   refreshButton.onclick = () => {
    //     fetch(`/refresh_token?refresh_token=${refresh_token}`)
    //     .then(res => res.json())
    //     .then(result => console.log(result))
    //   }
    // }
  })()