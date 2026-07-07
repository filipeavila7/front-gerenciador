import MyBalance from "../components/transactions/MyBalance"
import "../styles/balance.css"
import UserData from "../components/user/UserData"

function Dashboard() {
  return (

    <>

      <div className="dashboard-header">
        <UserData/>
      </div>

      <div className="dashboard-lay">
        <MyBalance />
        <MyBalance />
        <MyBalance />
        <MyBalance />

      </div>

    </>



  )
}

export default Dashboard