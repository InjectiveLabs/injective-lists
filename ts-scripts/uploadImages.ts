import 'dotenv/config'
import { writeFile, readdirSync, readFileSync, createReadStream } from 'node:fs'
import axios from 'axios'
import * as FormData from 'form-data'
import * as existingTokenImagePaths from '../tokens/tokenImagePaths.json'

const extensions = ['png', 'jpg', 'jpeg', 'svg', 'webp']
const imgDirectoryPath = './images'

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

    const updatedTokenImagePaths = JSON.stringify(
      {
        ...JSON.parse(readFileSync('./../tokens/tokenImagePaths.json', 'utf8')),
        [imageName]: data.data.result.variants[0]
      },
      null,
      2
    )

    await writeFile(
      './../tokens/tokenImagePaths.json',
      updatedTokenImagePaths,
      (err) => {
        if (err) {
          console.error(`Error writing tokenImagePaths:`, err)
        }
      }
    )

    console.log('✅✅✅ UploadImages')
  } catch (e) {
    console.log('Error uploadImage', e)
  }
}

const uploadImages = async () => {
  try {
    const uploadedImages = Object.keys(existingTokenImagePaths)

    const files = await readdirSync(imgDirectoryPath)

    const filteredFileNames = files.filter(
      (fileName) =>
        extensions.includes(fileName.split('.').pop() as string) &&
        !uploadedImages.includes(fileName)
    )

    for (const filename of filteredFileNames) {
      await uploadImage(filename)
    }
  } catch (e) {
    console.log('Error uploadImages', e)

    return
  }
}

uploadImages()
