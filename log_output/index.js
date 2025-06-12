import { v4 } from  'uuid';

const stringGenerator = () => {

  const newString = v4()

  const newDate = new Date()

  const result = [newDate.toISOString() , newString].join(': ')

  console.log(result)

  setTimeout(stringGenerator, 5000)
}

stringGenerator()
