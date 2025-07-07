# add path homebrew (MAC)
export PATH="/opt/homebrew/bin:$PATH"

# install node
brew install node

# check node version
node -v

# install yarn
npm install --global yarn

# check yarn version
yarn --version

# create vue project
vue create project_name


# sonar-scanner add PATH (download sonar-scanner from Sonar official website)
export PATH="/Users/franciscomendoza/Documents/DEV/SBM-SUITE/testing/sonarqube/sonar-scanner-6.2.1.4610-macosx-aarch64/bin:$PATH"

# scan project SBM-SUITE-STORE
sonar-scanner \
  -Dsonar.projectKey=SBM-suite-STORE \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token=sqp_63d28654dd6116f873d80ad75cd0980a76d195c5