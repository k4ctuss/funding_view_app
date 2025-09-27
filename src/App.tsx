import {DeltaNeutralTable} from './components/DeltaNeutralTable'
import { Button } from './components/ui/button'

function App() {

  return (
    <>
			<div className="App">
				<h1 className="text-3xl font-bold underline">
					Hello world!
				</h1>
				<main className="p-6">
					<Button variant="outline">Default</Button>
          <DeltaNeutralTable />
        </main>
			</div>
    </>
  )
}

export default App
