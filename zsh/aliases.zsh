alias reload!='. ~/.zshrc'

alias cls='clear' # Good 'ol Clear Screen command
alias gtcf='cd ~/code'
alias gtaf='cd ~/code/ruby/gems/alchemy_cms'
alias test_alchemy='rm Gemfile.lock; bundle install; bundle exec rake alchemy:spec:prepare; bundle exec rspec'
