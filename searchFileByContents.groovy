import groovy.io.FileType
import java.util.stream.Collectors
import groovy.util.*
import groovy.json.*

def filez = getFileMap()
def json = new groovy.json.JsonBuilder(filez).toPrettyString()
println json



def getFileMap() {
        
        def filePathList = new FileNameFinder().getFileNames('./','test/**/*_test.*')

        def arrList = []
        
        for (eachFile in filePathList){
        FilePair pair = new FilePair();
        pair.name = eachFile;
        pair.contents = getFileContents(eachFile);
        arrList.add(pair);
        }
        
    return arrList
    }
    
    
    def getFileContents(String thePath){
    String fileContents = new File(thePath).text
    return fileContents
    }
    
    
    class FilePair{
     String name;
    String contents;
    

    }