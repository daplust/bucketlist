import { Button, Container, Stack } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import BucketListForm from './components/BucketListForm';
import BucketList from './components/BucketList';

export const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:4000/api" : "/api";

function App() {

  return (
    <>
    <Stack h="100vh">
      <Navbar />
      <Container>
				<BucketListForm />
				<BucketList />
			</Container>
    </Stack>
    </>
  )
}

export default App
