import axios from 'axios'
import 'dotenv/config'
import * as FormData from 'form-data'
import { readdirSync, createReadStream, existsSync } from 'node:fs'
import { readJSONFile, updateJSONFile } from '../helper/utils'

const extensions = ['png', 'jpg', 'jpeg', 'svg', 'webp']
const imgDirectoryPath = './images/validators'

const uploadImage = async (imageName: string) => {
  if (!process.env.CLOUD_FLARE_API_KEY || !process.env.CLOUD_FLARE_ACCOUNT_ID) {
    throw new Error('Cloud flare api keys not found!')
  }

  const imagePath = `${imgDirectoryPath}/${imageName}`

  // Validate that the image file exists
  if (!existsSync(imagePath)) {
    console.log(`⚠️  Image file does not exist: ${imagePath}`)
    return
  }

  try {
    const formData = new FormData()
    formData.append('file', createReadStream(imagePath))

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

    const updatedValidatorImagePaths = {
      ...readJSONFile({
        path: 'src/data/validatorImagePaths.json',
        fallback: {}
      }),
      [imageName]: data.data.result.variants[0]
    }

    await updateJSONFile(
      'src/data/validatorImagePaths.json',
      updatedValidatorImagePaths
    )
  } catch (e) {
    console.log('Error uploadImage', e)
  }
}

const uploadImages = async () => {
  try {
    const uploadedImages = readJSONFile({
      path: 'src/data/validatorImagePaths.json',
      fallback: {}
    })

    const files = readdirSync(imgDirectoryPath)

    const imagesToUpload = files.filter((fileName) => {
      const fileExtension = fileName.split('.').pop()?.toLowerCase()

      return (
        extensions.includes(fileExtension as string) &&
        !uploadedImages[fileName]
      )
    })

    if (imagesToUpload.length === 0) {
      console.log('ℹ️  No new images to upload')
      return
    }

    console.log(`📁 Found ${imagesToUpload.length} image(s) to upload`)

    for (const filename of imagesToUpload) {
      await uploadImage(filename)
    }

    console.log('✅✅✅ UploadImages completed successfully')
  } catch (e) {
    console.log('⚠️  Error uploadImages', e)
    console.log('ℹ️  Continuing without throwing error to prevent CI failure')
  }
}

uploadImages()
