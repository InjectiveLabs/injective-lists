import axios from 'axios'
import { config } from 'dotenv'
import * as FormData from 'form-data'
import { readdirSync, createReadStream } from 'node:fs'
import { readJSONFile, updateJSONFile } from './helper/utils'

config({ path: './../.env' })
const extensions = ['png', 'jpg', 'jpeg', 'svg', 'webp']
const imgDirectoryPath = './images'

console.log({
  CLOUD_FLARE_API_KEY: process.env.CLOUD_FLARE_API_KEY,
  CLOUD_FLARE_ACCOUNT_ID: process.env.CLOUD_FLARE_ACCOUNT_ID
})

const uploadImage = async (imageName: string) => {
  try {
    const formData = new FormData()
    formData.append(
      'file',
      createReadStream(`${imgDirectoryPath}/${imageName}`)
    )

    const data = (await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUD_FLARE_ACCOUNT_ID}/images/v1`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.CLOUD_FLARE_API_KEY}`
        }
      }
    )) as { data: { result: { filename: string; variants: string[] } } }

    console.log(
      ` ✅ Uploaded image: ${data.data.result.filename} with url ${data.data.result.variants[0]}`
    )

    const updatedTokenImagePaths = {
      ...readJSONFile({
        path: 'tokens/tokenImagePaths.json',
        fallback: {}
      }),
      [imageName]: data.data.result.variants[0]
    }

    await updateJSONFile('tokens/tokenImagePaths.json', updatedTokenImagePaths)
  } catch (e) {
    console.log('Error uploadImage', e)
  }
}

const uploadImages = async () => {
  try {
    const uploadedImages = readJSONFile({
      path: 'tokens/tokenImagePaths.json',
      fallback: {}
    })

    const files = readdirSync(imgDirectoryPath)

    const filteredFileNames = files.filter(
      (fileName) =>
        extensions.includes(fileName.split('.').pop() as string) &&
        !uploadedImages[fileName]
    )

    for (const filename of filteredFileNames) {
      await uploadImage(filename)
    }

    console.log('✅✅✅ UploadImages')
  } catch (e) {
    console.log('Error uploadImages', e)

    return
  }
}

uploadImages()
