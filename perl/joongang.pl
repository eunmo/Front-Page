use LWP::Simple;
use feature 'unicode_strings';
use utf8;
use Encode;
use Mojo::DOM;
use Mojo::Collection;
use DateTime;
binmode(STDOUT, ":utf8");

my $date = $ARGV[0];
my $url = getUrl();
my $html = get("$url");
my $dom = Mojo::DOM->new($html);

my $json = "[";
my $count = 0;

my $ul = $dom->find('ul[class~="type13"]')->first;

for my $li ($ul->find('li')->each) {
	
	my $a = $li->find('a')->first;
	my $href = $a->attr('href');
	my $title = $a->all_text;
	$href =~ s/http:\/\/news.naver.com//;

	$json .= "," if $count++;
	$json .= "{\"href\": \"$href\", \"title\": \"$title\"}";
}

$json .= "]";
print $json;

sub getUrl
{
	$date =~ /^(.{4})(.{2})(.{2})/;
	my $day = DateTime->new( year => $1, month => $2, day => $3)->day_of_week();
	if ($day == 7) { # joongang sunday
		return "http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=353&listType=paper&date=$date";
	} else {
		return "http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=025&listType=paper&date=$date";
	}
}
