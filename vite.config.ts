import basicSsl from '@vitejs/plugin-basic-ssl'
import Terminal from 'vite-plugin-terminal'

export default {
  plugins: [
    basicSsl(),
		Terminal()
  ]
}