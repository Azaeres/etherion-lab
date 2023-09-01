import { ISpritesheetData, Spritesheet, Texture } from 'pixi.js'
import { useEffect, useMemo, useState } from 'react'

type AssetRecord = {
  textureFrom: string
  metadata: ISpritesheetData
  refCount: number
  spritesheet: Spritesheet
}

const CacheRecord = new Map<string, AssetRecord>()

// const spritesheet = useSpritesheet(asteroidsTexture.src, asteroidsJson)

export default function useSpritesheetTextures(textureFrom: string, metadata: ISpritesheetData) {
  const spritesheet = useSpritesheet(textureFrom, metadata)
  return useMemo(() => spritesheet && Object.values(spritesheet?.textures), [spritesheet])
}

export function useSpritesheetTextureMap(textureFrom: string, metadata: ISpritesheetData) {
  const spritesheet = useSpritesheet(textureFrom, metadata)
  return useMemo(() => spritesheet && spritesheet?.textures, [spritesheet])
}

export function useSpritesheet(textureFrom: string, metadata: ISpritesheetData) {
  const [record, setRecord] = useState<AssetRecord>()
  useEffect(() => {
    // console.log('useSpritesheet useEffect > textureFrom:', textureFrom, metadata)
    // console.log(' > utils.TextureCache:', utils.TextureCache)
    ;(async () => {
      const _record = CacheRecord.get(textureFrom)
      if (_record) {
        // console.log('Found > _record:', _record)
        _record.refCount = _record.refCount + 1
        setRecord(_record)
      } else {
        // console.log('Record NOT FOUND. Creating new spritesheet...  :')
        const spritesheet = new Spritesheet(Texture.from(textureFrom), metadata)
        // console.log('Created  > spritesheet:', spritesheet)
        // debugger
        const _record = {
          textureFrom,
          metadata,
          refCount: 1,
          spritesheet,
        }
        CacheRecord.set(textureFrom, _record)
        await spritesheet.parse()
        // console.log('Spritesheet parsed and added to cache  > textureFrom:', textureFrom)
        setRecord(_record)
      }
    })()
    return () => {
      const _record = CacheRecord.get(textureFrom)
      if (_record) {
        _record.refCount = _record.refCount - 1
        // console.log('refCount decreased to  :', _record.refCount)
        if (_record.refCount === 0) {
          // console.log('DESTROYING SPRITESHEET  , _record:', _record)
          const { spritesheet } = _record
          spritesheet.destroy(true)
          CacheRecord.delete(textureFrom)
        }
      }
    }
  }, [metadata, textureFrom])

  return record?.spritesheet
}
