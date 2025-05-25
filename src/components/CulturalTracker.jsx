
import { useState, useEffect } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Papa from 'papaparse';

const EVENT_TYPES = ["Play","Opera","Concert","Musicals","Exhibition"];
const VENUES=["Off Broadway","Lincoln Center","Broadway","BAM"];

function Star({ filled, half, onClick }) {
  const d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";
  return (
    <span onClick={onClick} className="relative inline-block w-6 h-6">
      {half?(
        <svg viewBox="0 0 24 24" fill="currentColor" className="absolute w-6 h-6 text-yellow-400"><path d={d}/></svg>
      ):null}
      <svg viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d={d}/>
      </svg>
    </span>
  );
}

export default function CulturalTracker(){
  const [entries,setEntries]=useState([]);
  const [form,setForm]=useState({title:"",type:"",date:"",loc:"",notes:"",rating:0,venue:""});
  const [search,setSearch]=useState("");
  const [sortKey,setSortKey]=useState("date");
  const [sortOrder,setSortOrder]=useState("asc");
  const [undoStack,setUndoStack]=useState(null);
  const [hoverDate,setHoverDate]=useState(null);
  const [hoverPos,setHoverPos]=useState({x:0,y:0});
  const [flash,setFlash]=useState(null);

  const {isLoaded}=useJsApiLoader({googleMapsApiKey:import.meta.env.VITE_GOOGLE_MAPS_API_KEY,libraries:['places']});

  useEffect(()=>{
    const s=JSON.parse(localStorage.getItem("ct-entries")||"[]");
    setEntries(s);
    if(s.length){
      setFlash(s[Math.floor(Math.random()*s.length)]);
    }
  },[]);

  const save=(e)=>{e.preventDefault();
    if(!form.title||!form.type||!form.date||!form.loc||!form.rating) return;
    const updated=[form,...entries];
    setEntries(updated);
    localStorage.setItem("ct-entries",JSON.stringify(updated));
    setForm({title:"",type:"",date:"",loc:"",notes:"",rating:0,venue:""});
  };

  const deleteEntry=(i)=>{
    const removed=entries[i];
    setUndoStack({entry:removed,index:i});
    const updated=entries.filter((_,j)=>j!==i);
    setEntries(updated);
    localStorage.setItem("ct-entries",JSON.stringify(updated));
  };
  const undo=()=>{
    if(undoStack){
      const arr=[...entries];
      arr.splice(undoStack.index,0,undoStack.entry);
      setEntries(arr);
      localStorage.setItem("ct-entries",JSON.stringify(arr));
      setUndoStack(null);
    }
  };

  const exportCSV=()=>{
    const csv=Papa.unparse(entries.map(e=>({
      Event:e.title,Type:e.type,Date:e.date,Location:e.loc,Venue:e.venue,Rating:e.rating,Notes:e.notes
    })));
    const b=new Blob([csv],{type:"text/csv"}),u=URL.createObjectURL(b),a=document.createElement("a");
    a.href=u;a.download="ct.csv";document.body.appendChild(a);a.click();document.body.removeChild(a);
  };

  const importCSV=(file)=>{
    Papa.parse(file,{header:true,complete:r=>{
      const imp=r.data.map(e=>({
        title:e.Event,type:e.Type,date:e.Date,loc:e.Location,venue:e.Venue,rating:parseFloat(e.Rating),notes:e.Notes
      }));
      const all=[...imp,...entries];
      setEntries(all);
      localStorage.setItem("ct-entries",JSON.stringify(all));
    }});
  };

  const filtered=entries.filter(e=>e.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>sortOrder==="asc"?a[sortKey].localeCompare(b[sortKey]):b[sortKey].localeCompare(a[sortKey]));

  const stats={
    avg:entries.reduce((sum,e)=>sum+e.rating,0)/(entries.length||1),
    most:entries.reduce((acc,e)=>acc[e.venue]?({...acc,[e.venue]:acc[e.venue]+1}):({...acc,[e.venue]:1}),{}),
    total:entries.length
  };
  const mostVenue=Object.keys(stats.most).reduce((a,b)=>stats.most[a]>stats.most[b]?a:b,"")||"";

  return (
<div className="p-4 max-w-4xl mx-auto">
  <h1 className="text-2xl font-bold mb-4">Cultural Tracker</h1>
  {flash&&<div className="mb-4 p-2 bg-gray-800 rounded">🔙 Flashback: {flash.title} on {flash.date}</div>}
  <form onSubmit={save} className="bg-gray-900 p-4 rounded mb-6 space-y-4">
    <input placeholder="Event Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
      className="w-full p-2 bg-black rounded border"/>
    <div className="flex gap-2">
      {EVENT_TYPES.map(t=><button type="button" key={t} onClick={()=>setForm({...form,type:t})}
        className={`px-2 py-1 rounded ${form.type===t?"bg-blue-600":"border"}`}>{t}</button>)}
    </div>
    <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}
      className="w-full p-2 bg-black rounded border"/>
    {isLoaded?(<Autocomplete onLoad={a=>console.log(a)} onPlaceChanged={()=>{}}>
      <input placeholder="Location" value={form.loc} onChange={e=>setForm({...form,loc:e.target.value})}
        className="w-full p-2 bg-black rounded border"/>
    </Autocomplete>):<input placeholder="Location" disabled className="w-full p-2 bg-gray-700 rounded"/>}
    <div className="flex gap-1">
      {[...Array(10)].map((_,i)=>(
        <Star key={i} filled={form.rating> i} half={form.rating===i+0.5}
          onClick={e=>{const rect=e.target.getBoundingClientRect();
             const isHalf=(e.clientX-rect.left)<rect.width/2;
             setForm({...form,rating:isHalf?i+0.5:i+1});}}/>
      ))}
    </div>
    <textarea placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}
      className="w-full p-2 bg-black rounded border"/>
    <div className="flex gap-2">
      <button type="submit" className="bg-green-600 px-4 py-2 rounded">Add</button>
      <button type="button" onClick={exportCSV} className="bg-blue-600 px-4 py-2 rounded">Export CSV</button>
      <input type="file" accept=".csv" onChange={e=>importCSV(e.target.files[0])}
        className="text-sm"/>
    </div>
  </form>
  {undoStack&&<div className="mb-4"><button onClick={undo} className="underline">Undo delete</button></div>}
  <div className="mb-4 space-y-1">
    <div>Total: {stats.total}</div>
    <div>Average Rating: {stats.avg.toFixed(1)}</div>
    <div>Top Venue: {mostVenue}</div>
  </div>
  <input placeholder="Search Event" value={search} onChange={e=>setSearch(e.target.value)}
    className="w-full p-2 bg-black rounded mb-2 border"/>
  <table className="w-full border-collapse">
    <thead>
      <tr>
        {["title","type","date","loc","venue","rating"].map(key=>(
          <th key={key} onClick={()=>{setSortKey(key);setSortOrder(s=>s==="asc"?"desc":"asc");}}
            className="p-2 cursor-pointer">{key.toUpperCase()}{sortKey===key?(sortOrder==="asc"?"↑":"↓"):""}</th>
        ))}
        <th className="p-2">DEL</th>
      </tr>
    </thead>
    <tbody>
      {filtered.map((e,i)=>(
        <tr key={i} className="hover:bg-gray-800">
          <td className="p-2">{e.title}</td>
          <td className="p-2"><span className="px-2 py-1 bg-purple-600 rounded">{e.type}</span></td>
          <td className="p-2 relative" onMouseEnter={ev=>{setHoverDate(new Date(e.date));setHoverPos({x:ev.clientX,y:ev.clientY});}}
            onMouseLeave={()=>setHoverDate(null)}>{e.date}
            {hoverDate&&<div style={{position:'fixed',left:hoverPos.x+10,top:hoverPos.y-200}}><Calendar value={hoverDate}/></div>}
          </td>
          <td className="p-2">{e.loc}</td>
          <td className="p-2"><span className="px-2 py-1 bg-green-600 rounded">{e.venue}</span></td>
          <td className="p-2">{e.rating}</td>
          <td className="p-2"><button onClick={()=>deleteEntry(i)} className="text-red-500">🗑</button></td>
        </tr>
      ))}
    </tbody>
  </table>
  {/** Countdown and flash handled above **/}
</div>

  );
}
