import volleyballdig from '../assets/volleyballdig.gif'

function Spinner() {
  return (
    <div className='w-100 mt-20'>
      <img
        width={180}
        className='text-center mx-auto'
        src={volleyballdig}
        alt='Loading...'
      />
    </div>
  )
}

export default Spinner
