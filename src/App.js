import React, {useState} from 'react'
import "./App.css"
import bgImage from "./images/wood_image.jpeg"
import {AiOutlineSearch} from "react-icons/ai"
import { Modal, Button, Row, Col, FloatingLabel, Form} from 'react-bootstrap';
import Loader from './Loader/Loader';

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY

const SearchTopicModal = ({onHide, show, generate}) => {
  const [faculty, setFaculty] = useState(null)
  const [department, setDepartment] = useState(null)
  const [institution, setInstitution] = useState(null)
  const [topicsCount, setTopicsCount] = useState(0)
  const [keywords, setKeywords] = useState(null)

  function sendData() {
    const keywordsArray = keywords ? keywords.split(",") : ""
    if (!department || !faculty || !institution) {
      alert("Please fill in all details correctly before proceeding")
      return
    }

    if (topicsCount < 1 || topicsCount > 5) {
      alert("Number of topics should be between 1 and 5");
      return;
    }

    const data = {
      faculty,
      department,
      institution,
      topicsCount,
      keywords: keywordsArray
    }

    generate(data)
  }

  return (
    <Modal  
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Please let us know a little about you
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>

        {/* A */}
      <Row className="g-2 mb-5">
      <Col md>
        <FloatingLabel controlId="floatingInputGrid" label="Faculty">
          <Form.Control type="text" placeholder="Science, Arts, Management Sciences" value={faculty} onChange={e => setFaculty(e.target.value)}/>
        </FloatingLabel>
      </Col>
      <Col md>
        <FloatingLabel
          controlId="floatingSelectGrid"
          label="Department"
        >
          <Form.Control type='text' placeholder='Computer Science, Economics, Sociology' value={department} onChange={e => setDepartment(e.target.value)}/>
        </FloatingLabel>
      </Col>
    </Row>

    {/* B */}
    <Row className="g-2 mb-5">
      <Col md>
        <FloatingLabel controlId="floatingInputGrid" label="Institution (University, Polythecnic, College of Education, etc.">
          <Form.Control type="text" placeholder="University" value={institution} onChange={e => setInstitution(e.target.value)} />
        </FloatingLabel>
      </Col>
      <Col md>
        <FloatingLabel
          controlId="floatingSelectGrid"
          label="Number of topics to generate (5 max)"
        >
          <Form.Control type='number' placeholder='5' max={"5"} min={"0"} value={topicsCount}  onChange={e => setTopicsCount(e.target.value)}/>
        </FloatingLabel>
      </Col>
    </Row>

    {/* C */}
    <Row className="g-2 mb-4">
      <Col md>
        <FloatingLabel controlId="floatingInputGrid" label="Comma separated keywords to include in project topic (e.g AI/ML, IOT, Health, History, etc)">
          <Form.Control type="text" placeholder="Artificial Intelligence, Automation, History, Processes, etc" value={keywords}  onChange={e => setKeywords(e.target.value)} />
        </FloatingLabel>
      </Col>
    </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='dark' onClick={() => sendData()}>Generate</Button>
        <Button variant='dark' onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

const ShowTopicsModal = ({data, onHide, show, topics}) => {
  return  (
  <Modal  
  show={show}
  size="lg"
  aria-labelledby="contained-modal-title-vcenter"
  centered
>
  <Modal.Header>
    <Modal.Title id="contained-modal-title-vcenter">
      Select any topic from the list
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div className='topics'>
      <div>{data.topicsCount} topics generated for final year {data.institution} student in faculty of {data.faculty} and department of {data.department}. </div>
    {topics.split("\n").filter(i => i.length != 0).map(topic => (
    <div className='topic'>
      <div className='topic-title'>{topic.split(":")[0]}</div>
      <div className='topic-desc'>{topic.split(":")[1]}</div>
    </div>
    ))}
    </div>
  </Modal.Body>
  <Modal.Footer>
    <Button variant='dark' onClick={onHide}>Close</Button>
  </Modal.Footer>
</Modal>
  )
}

const App = () => {
  const [modalShow, setModalShow] = useState(false)
  const [topicsModalShow, setTopicsModalShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [topics, setTopics] = useState(null)
  const [data, setData] = useState(null)

  function generatePrompt(input) {
    const {faculty, department, institution, topicsCount, keywords} = input;
    const prompt1 = `Generate ${topicsCount} project topics for final year ${institution} student in the department of ${department} and faculty of ${faculty} that incorporate the keywords ${keywords.length > 0? keywords.map(keyword => `"${keyword.trim()}"`): ""} along with a description of the topic in a JavaScript array format`
    const prompt2 = `Generate ${topicsCount} project topics for final year ${institution} student in the department of ${department} and faculty of ${faculty} that incorporate the keywords ${keywords ? keywords.map(keyword => `"${keyword.trim()}"`) : ""} along with a description of the topic`

    return prompt2
  }

  function parseResponse(response) {
    const r = response.choices[0].text.trim()
    setTopics(r)
  }

  async function generate(input) {
    setData(input)
    const prompt = generatePrompt(input)

    const APIBody = {
      model: "text-davinci-003",
      prompt,
      temperature: 0,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    }

    try {
      setLoading(true)
      setModalShow(false);
      setTopicsModalShow(false);
      await fetch("https://api.openai.com/v1/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + API_KEY
            },
            body: JSON.stringify(APIBody)
          }).then(res => {
            return res.json()
          }).then(data => {
            console.log(data)
            parseResponse(data)
          })
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)      
      setTopicsModalShow(true)
    }
   
  }

  return (
    <div className='main'> 
    <img className='bg-image' src={bgImage}/>
    {loading ? <Loader/>: modalShow? <SearchTopicModal show={modalShow} onHide={() => setModalShow(false)} generate={generate}/> : topicsModalShow ? <ShowTopicsModal data={data} show={topicsModalShow} onHide={() => setTopicsModalShow(false)} topics={topics}/> : ""}
     <div className='app'>
      <div className='heading'>
        <h1>Topic<span>Finder</span></h1>
      </div>
      <div className='body'>
        <div className='left-section'>
          <p className='p1'>Need a <span>Topic</span> for your final year project or research?</p>
          <p className='p2'>Search for final year project topics from our website by typing keywords related to your topic</p>
          <div onClick={() => setModalShow(true)} className='search-button'><span>Search Topics</span> <AiOutlineSearch fontSize={"35px"}/></div>
        </div>
        <div className='right-section'>
          <div className='right-container'></div>
        </div>
      </div>
    </div>
    </div>
   
  )
}

export default App