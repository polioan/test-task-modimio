import { Container } from 'inversify'

import { rootModule } from './modules/root.js'

export const container = new Container({})

container.load(rootModule)
