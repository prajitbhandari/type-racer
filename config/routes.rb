Rails.application.routes.draw do
  get 'race_templates/new'
  devise_for :users
  post 'type_races/create_or_join', to: 'type_races#create_or_join'
  # get 'type_races/poll', to: 'type_races#poll'
  get 'type_races/poll/:id', to: 'type_races#poll', as: 'type_races_poll'
  get 'type_races/index'
  root to: "type_races#index"
  get 'type_races/:id', to: 'type_races#show', as: 'type_race'
  # post 'type_races/create'
  put 'type_races/:id', to: 'type_races#update'
  resources :race_templates
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
