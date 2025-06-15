import { v4 } from  'uuid';

const stringGenerator = () => {
  const newString = v4()
  const newDate = new Date()

  return [newDate.toISOString() , newString].join(': ')
}

export default stringGenerator
