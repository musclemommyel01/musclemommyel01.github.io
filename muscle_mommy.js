var z=100;

function mege8os(){
		var w = innerWidth;
        var h = innerHeight;
        if(w/h<1440/3120){
            document.body.style.zoom=((w/1440)*z)+"%";
        }else{
            document.body.style.zoom=((h/3120)*z)+"%";
        } 
    }




function showScreen(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-'+name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('[data-screen="'+name+'"]').forEach(b=>b.classList.add('active'));
}

function toggleCb(el){ el.classList.toggle('checked'); }
