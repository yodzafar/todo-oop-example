const sample = localStorage.getItem('todo') ? JSON.parse(localStorage.getItem('todo')).data : []

class TodoModel {
    #todo = []

    constructor() {
        this.init()
    }

    init() {
        this.todo = sample
    }

    saveToStorage(data) {
        localStorage.setItem('todo', JSON.stringify({ data }))
    }

    add(title) {
        const todos = [...this.todo]
        const newItem = {
            id: new Date().getTime(),
            title,
            completed: false
        }
        todos.push(newItem)
        this.todo = todos
        this.saveToStorage(todos)

        return newItem
    }

    remove(id) {
        let data = [...this.todo]
        data = data.filter(item => item.id !== id)
        this.saveToStorage(data)
        this.todo = data
    }

    update(data) {
        let todos = [...this.todo]
        const idx = todos.findIndex(item => item.id === data.id)
        if (idx !== -1) {
            const item = { ...todos[idx], ...data }
            todos = [...todos.slice(0, idx), item, ...todos.slice(idx + 1)]
            this.saveToStorage(todos)
            this.todo = todos
        }
    }

    get getTodo() {
        return this.todo
    }
}

class Components {
    form = document.getElementById('form')
    input = document.getElementById('input')
    list = document.getElementById('list')
    all = document.getElementById('all')
    active = document.getElementById('active')
    completed = document.getElementById('completed')

    createListItem(itemData) {
        const item = document.createElement('div')
        const span = document.createElement('span')
        const removeBtn = document.createElement('button')
        const editBtn = document.createElement('button')
        item.classList.add('todo-item')
        span.innerHTML = itemData.title
        removeBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>'
        removeBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'ms-2')
        editBtn.classList.add('btn', 'btn-success', 'btn-sm', 'ms-auto')
        editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>'
        if (itemData.completed) {
            item.classList.add('completed')
        }
        const checkbox = this.createListCheckbox(itemData)
        item.appendChild(checkbox)
        item.appendChild(span)
        item.appendChild(editBtn)
        item.appendChild(removeBtn)
        return { item, span, checkbox, editBtn, removeBtn }
    }

    createListCheckbox(itemData) {
        const input = document.createElement('input')
        input.type = 'checkbox'
        input.checked = itemData.completed
        input.classList.add('form-check-input', 'mt-0')
        return input
    }

    getAllText(text) {
        this.all.innerHTML = text
    }

    getCompletedText(text) {
        this.completed.innerHTML = text
    }

    getActiveText(text) {
        this.active.innerHTML = text
    }
}


class TodoApp {
    text = ''
    edit = null

    constructor() {
        this.todoModel = new TodoModel()
        this.components = new Components()
        this.subscribeEvents()
        this.renderList()
        this.initCounters()
    }

    initCounters() {
        const todos = [...this.todoModel.todo]
        const active = todos.filter(item => !item.completed).length
        const completedCount = todos.filter(item => item.completed).length
        this.components.getCompletedText(completedCount)
        this.components.getAllText(todos.length)
        this.components.getActiveText(active)
    }

    subscribeEvents() {
        this.components.input.addEventListener('change', this.onChange.bind(this))
        this.components.form.addEventListener('submit', this.onSubmit.bind(this))
    }

    onChange(e) {
        this.text = e.target.value
    }

    onSubmit(e) {
        e.preventDefault()
        if (this.edit) {
            const { data, span, item, editBtn } = this.edit
            const newData = { ...data, title: this.text }
            this.todoModel.update(newData)
            span.innerHTML = this.text
            item.classList.remove('edited')
            editBtn.addEventListener('click', this.editItem.bind(this, newData, span, item, editBtn))
            this.edit = null
        } else {
            if (this.text.length > 2) {
                const data = this.todoModel.add(this.text)
                this.renderItem(data)
                this.initCounters()
            }
        }
        this.clearInput()
    }

    clearInput() {
        this.text = ''
        this.components.input.value = ''
    }

    renderList() {
        const data = this.todoModel.getTodo
        for (let item of data) {
            this.renderItem(item)
        }
    }

    renderItem(data) {
        const { item: listItem, checkbox, removeBtn, editBtn, span } = this.components.createListItem(data)
        checkbox.addEventListener('change', (e) => this.itemCompleted(e, data))
        removeBtn.addEventListener('click', this.removeItem.bind(this, data, listItem, removeBtn, checkbox))
        editBtn.addEventListener('click', this.editItem.bind(this, data, span, listItem, editBtn))
        this.components.list.appendChild(listItem)
    }

    removeItemEventListeners(editBtn, removeBtn, checkbox) {

    }

    removeItem(itemData, item, btn, checkbox) {
        this.todoModel.remove(itemData.id)
        btn.removeEventListener('click', this.removeItem.bind(this, itemData, item, btn, checkbox))
        checkbox.removeEventListener('change', (e) => this.removeItem(e, itemData))
        this.edit = null
        this.clearInput()
        item.remove()
        this.initCounters()
    }

    itemCompleted(e, itemData) {
        this.todoModel.update({ ...itemData, completed: e.target.checked })
        this.initCounters()
    }

    editItem(itemData, span, item, editBtn) {
        if (this.edit) {
            this.edit.item.classList.remove('edited')
        }

        editBtn.removeEventListener('click', this.editItem.bind(this, itemData, span, item, editBtn))

        item.classList.add('edited')
        this.edit = { data: itemData, span, item, editBtn }
        this.text = itemData.title
        this.components.input.value = itemData.title
        this.components.input.focus()

    }
}

new TodoApp()
