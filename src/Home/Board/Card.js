import React, { useContext, useEffect, useRef, useState } from 'react'
import { boardContext } from '../../Contexts/AppContexts';
import * as BackendActions from "../../Actions/BackendActions"
import { Modal } from '../Other/Modal';
import { BlurForm } from '../Other/BlurForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarsStaggered, faEdit, faListCheck, faNoteSticky, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Checklist } from './Checklist';
import { updateObjectArray } from '../../CustomHooks/useArrayState';


export const Card = (props) => {
  const [name, setName] = useState(props.name)
  const [id, setId] = useState(props.id)
  const [previousName, setPreviousName] = useState(props.name);
  const [description, setDescription] = useState(props.description)
  const [checklist, setChecklist] = useState(props.checklist)
  const {socket, token, loadedBoard, room} = useContext(boardContext)
  const [modalOpen, setModalOpen] = useState(false);
  
  
  useEffect(()=>{
    socket.on("change-card-name", (card, roomId)=>{
      if (room == roomId && id == card.id){
        setName(card.name)
        setPreviousName(card.name)
      }
    })

    socket.on("change-card-description", (card, roomId)=>{
      if (room == roomId && props.id == card.id){
        setDescription(card.description)
      }
    })

    socket.on("add-checkbox", (card, roomId, checklist, checkbox)=>{
      if (room == roomId && props.id == card.id){
        console.log(checkbox)
        setChecklist([...checklist, checkbox])
      }
    })

    
   
  }, [])


async function updateCardName(){
  if (name != "" && name != previousName){
    const card = {name:name, id:id}
    const response = await  BackendActions.updateCardName(token, loadedBoard, props.listId, card)
    if (response.success){
      props.logChange("changed the name of card, " + previousName + " to " + name)
      setName(name);
      setPreviousName(name);
      socket.emit("change-card-name", card, room)
    }

  } else{
    setName(previousName)
  }
  
}


async function updateDescription(){
  const card = {name:name, description:description, id:id}
  const response = await BackendActions.updateCardDescription(token, loadedBoard, props.listId, card)
  
  if (response.success){
    setDescription(description);
    props.logChange("changed " + name + "'s description to: " + description)
    socket.emit("change-card-description", card, room)
  }
}

async function addCheckbox(checkbox){
  const card = {name:name, id:id}
  const response = await BackendActions.addCheckbox(token, loadedBoard, props.listId, card, checkbox)
  props.logChange("added item " + checkbox.label + " to card " + name)
  socket.emit("add-checkbox", card, room, checklist, checkbox)
  setChecklist([...checklist, checkbox])


}

async function updateCheckbox(checkbox){
  const card = {name:name, id:id}
  console.log(checkbox)
  updateObjectArray(checklist, setChecklist, checkbox)
  const response = await BackendActions.updateCheckbox(token, loadedBoard, props.listId, card, checkbox)
  
  if (checkbox.checked){
    props.logChange("item " + checkbox.label + " of card " + name + " was completed")
  } else {
    props.logChange("item " + checkbox.label + " of card " + name + " incomplete")
  }
  
 

}






return (
  <div>
    <li onClick={()=>setModalOpen(true)}>
      {name}
      <div className='card-btn-container'>
      <div className="card-btn">
          <FontAwesomeIcon  icon={faEdit}  />
      </div>
    
      </div>
     
      
    </li>

    <Modal open={modalOpen} setModalOpen={setModalOpen}>
      <div className='card-modal'>
        <div>
          <label className='board-modal-header'>Card</label>
        </div>

        <div onClick={()=>{props.deleteCard(name, id)}} className="delete-card-btn">
          <FontAwesomeIcon  icon={faTrashAlt}  />
        </div>
           
            <hr></hr>
            <div className='card-modal-title'>
              <FontAwesomeIcon icon={faNoteSticky}/>
              <BlurForm  
                inputStyle={"list-title"} 
                value={name} 
                setValue={setName}  
                submit={()=>updateCardName(name)} 
                placeholder={"Card name"}/>
            </div>
          
        

              <div className='split-modal'>
                <div className='left-item'>
                  <h3><FontAwesomeIcon icon={faBarsStaggered}/> Description</h3>
                  <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className='card-description' placeholder="Add a more detailed description…"/>
                  <button onClick={()=>updateDescription()} className='card-save-button'>
                    Save
                  </button>
                </div>

                <div className='right-item'>
                  <h3><FontAwesomeIcon icon={faListCheck}/>Checklist</h3>
                  <Checklist cardId={id} checklist={checklist} addCheckbox={addCheckbox} updateCheckbox={updateCheckbox}/>
                </div>

              </div>
           
          </div> 

        
    </Modal>
    
  </div>
)

}