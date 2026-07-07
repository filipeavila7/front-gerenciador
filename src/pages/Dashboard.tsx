import MyBalance from "../components/transactions/MyBalance"
import "../styles/balance.css"

function Dashboard() {
  return (

    <div className="dashboard-lay">
      <MyBalance/>
      <MyBalance/>
      <MyBalance/>
      <MyBalance/>
      
    </div>
    
    
  )
}

export default Dashboard