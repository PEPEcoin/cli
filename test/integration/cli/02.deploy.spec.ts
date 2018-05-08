import * as fs from 'fs-extra'
import * as path from 'path'
import { expect } from 'chai'
import { tmpTest } from '../sandbox'
import Commando, { Response } from './Commando'

describe('deploy command', async () => {
  it('should display files before upload', async () => {
    await tmpTest(async (dirPath, done) => {
      const oldDir = process.cwd()
      process.chdir(dirPath)

      new Commando('dcl init', { silent: true, cmdPath: path.resolve('..', 'bin'), env: { DCL_ENV: 'dev' } })
        .when(/Scene title/, () => 'My test Scene\n')
        .when(/Your ethereum address/, () => '0x\n')
        .when(/Your name/, () => 'John Titor\n')
        .when(/Your email/, () => 'john.titor@example.com\n')
        .when(/Parcels comprising the scene/, () => '0,0\n')
        .when(/Which type of project would you like to generate/, () => 'static\n')
        .endWhen(/Installing dependencies.../)
        .on('end', () => {
          new Commando('dcl deploy', { silent: true, cmdPath: path.resolve('..', 'bin'), env: { DCL_ENV: 'dev' } })
            .when(/\(.* bytes\)\n/, msg => {
              const files = msg.trim().match(/(\w*\.\w*)/g)
              expect(files.includes('scene.json')).to.be.true
              expect(files.includes('scene.xml')).to.be.true
              return null
            })
            .when(/You are about to upload/, (msg: string) => {
              expect(msg.includes('You are about to upload 2 files')).to.be.true
              return Response.NO
            })
            .on('end', async () => {
              process.chdir(oldDir)
              done()
            })
        })
    })
  }).timeout(5000)
})
