import 'dotenv/config'
import axios from 'axios'
import * as FormData from 'form-data'
import { readdirSync, createReadStream } from 'node:fs'
import { readJSONFile, updateJSONFile } from '../helper/utils'

const extensions = ['png', 'jpg', 'jpeg', 'svg', 'webp']
const imgDirectoryPath = './images/tokens'

const uploadImage = async (imageName: string) => {
  if (!process.env.CLOUD_FLARE_API_KEY || !process.env.CLOUD_FLARE_ACCOUNT_ID) {
    throw new Error('Cloud flare api keys not found!')
  }

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
        path: 'src/data/tokenImagePaths.json',
        fallback: {}
      }),
      [imageName]: data.data.result.variants[0]
    }

    await updateJSONFile(
      'src/data/tokenImagePaths.json',
      updatedTokenImagePaths
    )
  } catch (e) {
    console.log('Error uploadImage', e)
  }
}

const uploadImages = async () => {
  console.log({
    CLOUD_FLARE_API_KEY: process.env.CLOUD_FLARE_API_KEY,
    CLOUD_FLARE_ACCOUNT_ID: process.env.CLOUD_FLARE_ACCOUNT_ID
  })

  try {
    const uploadedImages = readJSONFile({
      path: 'src/data/tokenImagePaths.json',
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

    throw new Error('Error uploadImages')
  }
}

uploadImages()
