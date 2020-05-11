(function search(){
    const loginButton = document.querySelector('.login');
    const searchParams = new URLSearchParams(window.location.search)
    const access_token = searchParams.get('access_token');
    // const refresh_token = searchParams.get('refresh_token');
    function addtoQ(id) {
        query = ''
        var x = document.getElementById("search").value;
        console.log(x)
        fetch(`/search?q=${x}&type=track&access_token=${access_token}`)
        .then(res => res.json())
        .then(({tracks : {items}})=>{
            
            query = items[0].id
            fetch(`/queue?uri=spotify:track:${query}&access_token=${access_token}`,{method:'post'}).then(res =>{
                console.log("yes")
            })
        })
        console.log(query)
        
    }
    const user_id = searchParams.get('user_id');
    if(access_token){
        //loginButton.disabled = true
        fetch(`/device?user_id=${user_id}&access_token=${access_token}`)
        .then(res => res.json())
        .then(({devices})=>{
            addtoQ(devices[0].id)
        })
        
    }
})()